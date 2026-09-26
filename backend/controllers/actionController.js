const { BeekeeperAction, RecoveryRecord, Hive } = require('../models');
const { logAudit } = require('../middleware/audit');

exports.recordAction = async (req, res) => {
  try {
    const { hive_id, action_date, action_type, reason, condition_before, condition_after, notes } = req.body;
    const hive = await Hive.findByPk(hive_id);
    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const action = await BeekeeperAction.create({
      hive_id,
      beekeeper_id: req.user ? req.user.id : 1,
      action_date: action_date || new Date().toISOString().split('T')[0],
      action_type,
      reason,
      condition_before: condition_before || `Score: ${hive.current_health_score}, Risk: ${hive.current_risk_level}`,
      condition_after: condition_after || 'Intervention completed, awaiting follow-up',
      notes
    });

    await logAudit(req.user?.id || 1, 'BEEKEEPER_ACTION_RECORDED', 'BeekeeperAction', action.id, { hive_id, action_type });

    res.status(201).json({ message: 'Beekeeper action recorded successfully', action });
  } catch (error) {
    console.error('recordAction error:', error);
    res.status(500).json({ error: 'Failed to record action.' });
  }
};

exports.recordRecovery = async (req, res) => {
  try {
    const { action_id, hive_id, follow_up_date, health_score, condition_status, outcome_notes } = req.body;

    const record = await RecoveryRecord.create({
      action_id,
      hive_id,
      follow_up_date: follow_up_date || new Date().toISOString().split('T')[0],
      health_score: parseFloat(health_score || 80.0),
      condition_status: condition_status || 'stable',
      outcome_notes
    });

    // Update hive health score if recovery noted
    if (health_score) {
      const hive = await Hive.findByPk(hive_id);
      if (hive) {
        const newScore = parseFloat(health_score);
        const newRisk = newScore >= 75 ? 'LOW' : (newScore >= 60 ? 'MEDIUM' : 'HIGH');
        await hive.update({ current_health_score: newScore, current_risk_level: newRisk });
      }
    }

    await logAudit(req.user?.id || 1, 'RECOVERY_RECORDED', 'RecoveryRecord', record.id, { hive_id, condition_status });

    res.status(201).json({ message: 'Recovery evaluation recorded successfully', record });
  } catch (error) {
    console.error('recordRecovery error:', error);
    res.status(500).json({ error: 'Failed to record recovery.' });
  }
};

exports.getAllActionsAndRecovery = async (req, res) => {
  try {
    const actions = await BeekeeperAction.findAll({
      include: [
        { model: Hive, as: 'hive', attributes: ['id', 'hive_code'] },
        { model: RecoveryRecord, as: 'recoveryRecords' }
      ],
      order: [['action_date', 'DESC']]
    });
    res.json({ actions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch action recovery history.' });
  }
};
