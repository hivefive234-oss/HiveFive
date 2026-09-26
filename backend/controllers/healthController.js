const { Hive, SensorReading, HealthScore, RiskPrediction, Recommendation } = require('../models');
const { Op } = require('sequelize');
const mlClient = require('../services/mlClient');

async function findHiveByIdOrCode(hiveId) {
  let hive = null;
  if (!isNaN(hiveId)) {
    hive = await Hive.findByPk(Number(hiveId), {
      include: [{ model: HealthScore, as: 'healthScores', limit: 1, order: [['calculated_at', 'DESC']] }]
    });
  }
  if (!hive) {
    hive = await Hive.findOne({
      where: {
        [Op.or]: [
          { hive_code: hiveId },
          { id: isNaN(hiveId) ? 0 : Number(hiveId) }
        ]
      },
      include: [{ model: HealthScore, as: 'healthScores', limit: 1, order: [['calculated_at', 'DESC']] }]
    });
  }
  if (!hive) {
    hive = await Hive.findOne({
      include: [{ model: HealthScore, as: 'healthScores', limit: 1, order: [['calculated_at', 'DESC']] }]
    });
  }
  return hive;
}

exports.analyzeHealth = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await findHiveByIdOrCode(hiveId);
    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const latest = await SensorReading.findOne({
      where: { hive_id: hive.id },
      order: [['timestamp', 'DESC']]
    });

    const payload = latest ? {
      temperature: latest.temperature,
      humidity: latest.humidity,
      weight: latest.weight,
      weight_delta_24h: latest.weight_delta_24h,
      acoustic_peak_hz: latest.acoustic_peak_hz,
      net_bee_traffic: latest.net_bee_traffic
    } : {
      temperature: 35.0,
      humidity: 55.0,
      weight: 42.0,
      weight_delta_24h: 0.1,
      acoustic_peak_hz: 235.0,
      net_bee_traffic: 50
    };

    const analysis = await mlClient.predictHealth(payload);
    const trajectory = await mlClient.predictTrajectory({
      currentScore: analysis.healthScore,
      trend: analysis.trend,
      riskLevel: analysis.riskLevel
    });
    const explanation = await mlClient.explain({
      healthScore: analysis.healthScore,
      riskLevel: analysis.riskLevel,
      factors: analysis.factors,
      hiveCode: hive.hive_code
    });

    res.json({
      hive_id: hive.id,
      hive_code: hive.hive_code,
      analysis,
      trajectory,
      explanation
    });
  } catch (error) {
    console.error('analyzeHealth error:', error);
    res.status(500).json({ error: 'Failed to evaluate hive health.' });
  }
};

exports.getExplainability = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await findHiveByIdOrCode(hiveId);
    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const latestScore = hive.healthScores?.[0];
    const factors = latestScore?.contributing_factors_json ? JSON.parse(latestScore.contributing_factors_json) : [];

    const explanation = await mlClient.explain({
      healthScore: hive.current_health_score,
      riskLevel: hive.current_risk_level,
      factors,
      hiveCode: hive.hive_code
    });

    res.json({ explanation });
  } catch (error) {
    console.error('getExplainability error:', error);
    res.status(500).json({ error: 'Failed to retrieve explainable factors.' });
  }
};

exports.getActionSimulation = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await findHiveByIdOrCode(hiveId);
    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const latestScore = await HealthScore.findOne({
      where: { hive_id: hive.id },
      order: [['calculated_at', 'DESC']]
    });

    const simulation = await mlClient.simulateAction({
      currentScore: hive.current_health_score,
      trend: latestScore ? latestScore.trend : 'STABLE'
    });

    res.json({ simulation });
  } catch (error) {
    console.error('getActionSimulation error:', error);
    res.status(500).json({ error: 'Failed to simulate actions.' });
  }
};

exports.getProductionImpact = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const hive = await findHiveByIdOrCode(hiveId);
    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const impact = await mlClient.predictProductionImpact({
      expectedBaselineKg: 24.0,
      healthScore: hive.current_health_score,
      weightTrend: hive.current_risk_level === 'HIGH' ? 'declining' : 'stable'
    });

    res.json({ impact });
  } catch (error) {
    console.error('getProductionImpact error:', error);
    res.status(500).json({ error: 'Failed to calculate production impact.' });
  }
};

exports.getModelInfo = async (req, res) => {
  try {
    const info = await mlClient.getModelMetadata();
    res.json({ model: info });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ML model info.' });
  }
};
