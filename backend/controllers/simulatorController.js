const { Hive, SensorReading, HealthScore } = require('../models');
const mlClient = require('../services/mlClient');

// Standard preset profiles for the 5 demo hives
const SCENARIOS = {
  H001: {
    label: 'H001 – Healthy',
    temp: 34.8,
    humidity: 56.0,
    weightDelta: +0.25,
    acoustics: 235.0,
    traffic: 68
  },
  H002: {
    label: 'H002 – Stable',
    temp: 35.1,
    humidity: 58.5,
    weightDelta: +0.05,
    acoustics: 242.0,
    traffic: 54
  },
  H003: {
    label: 'H003 – Increasing Risk',
    temp: 36.4,
    humidity: 76.5,
    weightDelta: -0.45,
    acoustics: 275.0,
    traffic: 32
  },
  H004: {
    label: 'H004 – High Risk',
    temp: 38.5,
    humidity: 82.0,
    weightDelta: -1.20,
    acoustics: 345.0,
    traffic: 12
  },
  H005: {
    label: 'H005 – Recovery',
    temp: 35.2,
    humidity: 62.0,
    weightDelta: +0.35,
    acoustics: 240.0,
    traffic: 48
  }
};

exports.getScenarios = (req, res) => {
  res.json({ scenarios: SCENARIOS });
};

exports.triggerSimulatedTick = async (req, res) => {
  try {
    const { hiveCode } = req.body;
    const hivesToUpdate = hiveCode
      ? await Hive.findAll({ where: { hive_code: hiveCode } })
      : await Hive.findAll();

    const results = [];

    for (const hive of hivesToUpdate) {
      const preset = SCENARIOS[hive.hive_code] || {
        temp: 35.0,
        humidity: 55.0,
        weightDelta: 0.1,
        acoustics: 240,
        traffic: 50
      };

      // Add minor realistic noise
      const tempJitter = (Math.random() - 0.5) * 0.4;
      const humJitter = (Math.random() - 0.5) * 1.5;
      const reading = await SensorReading.create({
        hive_id: hive.id,
        device_id: `ESP32-HV-${hive.hive_code}`,
        timestamp: new Date(),
        temperature: parseFloat((preset.temp + tempJitter).toFixed(1)),
        humidity: parseFloat((preset.humidity + humJitter).toFixed(1)),
        weight: parseFloat((42.0 + preset.weightDelta * 2).toFixed(2)),
        weight_delta_24h: preset.weightDelta,
        acoustic_peak_hz: preset.acoustics,
        acoustic_amplitude_db: -18.5,
        bee_activity_in: Math.round(preset.traffic / 2),
        bee_activity_out: Math.round(preset.traffic / 2),
        net_bee_traffic: preset.traffic,
        battery_v: 4.1,
        ambient_temp: 28.0,
        ambient_humidity: 62.0,
        is_simulated: true
      });

      // Health evaluation
      const analysis = await mlClient.predictHealth({
        temperature: reading.temperature,
        humidity: reading.humidity,
        weight: reading.weight,
        weight_delta_24h: reading.weight_delta_24h,
        acoustic_peak_hz: reading.acoustic_peak_hz,
        net_bee_traffic: reading.net_bee_traffic
      });

      await HealthScore.create({
        hive_id: hive.id,
        calculated_at: new Date(),
        score: analysis.healthScore,
        risk_level: analysis.riskLevel,
        trend: analysis.trend,
        contributing_factors_json: JSON.stringify(analysis.factors)
      });

      await hive.update({
        current_health_score: analysis.healthScore,
        current_risk_level: analysis.riskLevel
      });

      results.push({
        hive_code: hive.hive_code,
        score: analysis.healthScore,
        risk_level: analysis.riskLevel,
        reading
      });
    }

    res.json({
      message: `Simulated telemetry generated for ${results.length} hive(s)`,
      results
    });
  } catch (error) {
    console.error('triggerSimulatedTick error:', error);
    res.status(500).json({ error: 'Failed to trigger simulated telemetry tick.' });
  }
};
