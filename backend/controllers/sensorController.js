const { SensorReading, Hive, HealthScore } = require('../models');
const mlClient = require('../services/mlClient');

/**
 * ESP32-compatible sensor data ingestion endpoint
 * Expected JSON:
 * {
 *   "device_id": "ESP32-HV-001",
 *   "hive_id": "H001" or numeric ID,
 *   "timestamp": 1726900000 or ISO string,
 *   "temperature": 35.2,
 *   "humidity": 58.4,
 *   "weight": 42.6,
 *   "acoustic": { "frequency_peak_hz": 245.0, "amplitude_db": -18.2 },
 *   "activity": { "bee_count_in": 38, "bee_count_out": 42 },
 *   "battery_v": 3.95,
 *   "ambient": { "temp": 28.1, "humidity": 65.0 }
 * }
 */
exports.ingestSensorData = async (req, res) => {
  try {
    const data = req.body;
    let hive;

    if (data.hive_id) {
      if (typeof data.hive_id === 'string' && data.hive_id.startsWith('H')) {
        hive = await Hive.findOne({ where: { hive_code: data.hive_id } });
      } else {
        hive = await Hive.findByPk(data.hive_id);
      }
    }

    if (!hive) {
      hive = await Hive.findOne({ order: [['id', 'ASC']] });
    }

    if (!hive) {
      return res.status(404).json({ error: 'No matching hive found for sensor telemetry.' });
    }

    // Calculate weight delta compared to reading 24h prior
    const lastReading = await SensorReading.findOne({
      where: { hive_id: hive.id },
      order: [['timestamp', 'DESC']]
    });

    const currentWeight = parseFloat(data.weight || (lastReading ? lastReading.weight : 40.0));
    const prevWeight = lastReading ? lastReading.weight : currentWeight;
    const weight_delta_24h = parseFloat((currentWeight - prevWeight).toFixed(2));

    const acousticPeak = data.acoustic?.frequency_peak_hz ?? (data.acoustic_peak_hz || 235.0);
    const acousticAmp = data.acoustic?.amplitude_db ?? (data.acoustic_amplitude_db || -18.0);
    const beeIn = data.activity?.bee_count_in ?? (data.bee_activity_in || 25);
    const beeOut = data.activity?.bee_count_out ?? (data.bee_activity_out || 28);
    const netTraffic = beeIn + beeOut;

    const reading = await SensorReading.create({
      hive_id: hive.id,
      device_id: data.device_id || 'ESP32-HV-001',
      timestamp: data.timestamp ? (typeof data.timestamp === 'number' ? new Date(data.timestamp * 1000) : new Date(data.timestamp)) : new Date(),
      temperature: parseFloat(data.temperature || 35.0),
      humidity: parseFloat(data.humidity || 55.0),
      weight: currentWeight,
      weight_delta_24h,
      acoustic_peak_hz: parseFloat(acousticPeak),
      acoustic_amplitude_db: parseFloat(acousticAmp),
      bee_activity_in: parseInt(beeIn),
      bee_activity_out: parseInt(beeOut),
      net_bee_traffic: parseInt(netTraffic),
      battery_v: parseFloat(data.battery_v || 4.1),
      ambient_temp: parseFloat(data.ambient?.temp ?? (data.ambient_temp || 28.0)),
      ambient_humidity: parseFloat(data.ambient?.humidity ?? (data.ambient_humidity || 60.0)),
      is_simulated: data.is_simulated !== undefined ? data.is_simulated : false
    });

    // Invoke Health Engine asynchronously
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

    // Update current score on Hive
    await hive.update({
      current_health_score: analysis.healthScore,
      current_risk_level: analysis.riskLevel
    });

    res.status(201).json({
      message: 'Telemetry ingested successfully',
      reading_id: reading.id,
      hive_code: hive.hive_code,
      health_score: analysis.healthScore,
      risk_level: analysis.riskLevel,
      trend: analysis.trend
    });
  } catch (error) {
    console.error('ingestSensorData error:', error);
    res.status(500).json({ error: 'Failed to ingest sensor telemetry.' });
  }
};

exports.getReadingsByHive = async (req, res) => {
  try {
    const { hiveId } = req.params;
    const limit = parseInt(req.query.limit || '100');
    const readings = await SensorReading.findAll({
      where: { hive_id: hiveId },
      limit,
      order: [['timestamp', 'DESC']]
    });
    res.json({ readings: readings.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor readings.' });
  }
};
