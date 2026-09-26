const { User, Beekeeper, Apiary, Hive, HoneyBatch, AuditLog, SensorReading } = require('../models');
const { Op } = require('sequelize');

exports.getAdminMetrics = async (req, res) => {
  try {
    const totalBeekeepers = await User.count({ where: { role: 'beekeeper' } });
    const pendingBeekeepers = await User.count({ where: { role: 'beekeeper', status: 'pending' } });
    const totalApiaries = await Apiary.count();
    const totalHives = await Hive.count();

    const healthyHives = await Hive.count({ where: { current_risk_level: 'LOW' } });
    const mediumRiskHives = await Hive.count({ where: { current_risk_level: 'MEDIUM' } });
    const highRiskHives = await Hive.count({ where: { current_risk_level: 'HIGH' } });

    const totalBatches = await HoneyBatch.count();
    const totalHarvestedKg = (await HoneyBatch.sum('quantity_kg')) || 0;

    const highRiskHiveList = await Hive.findAll({
      where: { current_risk_level: { [Op.in]: ['MEDIUM', 'HIGH'] } },
      include: [{ model: Apiary, as: 'apiary' }],
      order: [['current_health_score', 'ASC']]
    });

    res.json({
      metrics: {
        totalBeekeepers,
        pendingBeekeepers,
        totalApiaries,
        totalHives,
        healthDistribution: {
          healthy: healthyHives,
          mediumRisk: mediumRiskHives,
          highRisk: highRiskHives
        },
        production: {
          totalBatches,
          totalHarvestedKg: parseFloat(totalHarvestedKg.toFixed(1))
        }
      },
      highRiskHives: highRiskHiveList
    });
  } catch (error) {
    console.error('getAdminMetrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin metrics.' });
  }
};

exports.getBeekeepers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'beekeeper' },
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Beekeeper, as: 'beekeeperProfile' }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ beekeepers: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch beekeepers.' });
  }
};

exports.updateBeekeeperStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await user.update({ status });
    res.json({ message: `Beekeeper status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update beekeeper status.' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      limit: 100,
      order: [['timestamp', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'full_name', 'role'] }]
    });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
};
