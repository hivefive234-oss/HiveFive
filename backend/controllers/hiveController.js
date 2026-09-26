const { Hive, Apiary, Beekeeper, SensorReading, HealthScore, RiskPrediction, Recommendation, BeekeeperAction, RecoveryRecord, QueenHistory, BroodObservation, CameraObservation, HoneyBatch, BlockchainRecord } = require('../models');
const { Op } = require('sequelize');

exports.getAllHives = async (req, res) => {
  try {
    const { apiary_id, risk_level, status } = req.query;
    const where = {};
    if (apiary_id) where.apiary_id = apiary_id;
    if (risk_level) where.current_risk_level = risk_level;
    if (status) where.status = status;

    const hives = await Hive.findAll({
      where,
      include: [
        { model: Apiary, as: 'apiary', attributes: ['id', 'name', 'location_name', 'flora_type'] },
        {
          model: SensorReading,
          as: 'sensorReadings',
          limit: 1,
          order: [['timestamp', 'DESC']]
        },
        {
          model: HealthScore,
          as: 'healthScores',
          limit: 1,
          order: [['calculated_at', 'DESC']]
        }
      ],
      order: [['hive_code', 'ASC']]
    });

    res.json({ hives });
  } catch (error) {
    console.error('getAllHives error:', error);
    res.status(500).json({ error: 'Failed to fetch hives.' });
  }
};

exports.getHiveById = async (req, res) => {
  try {
    const { id } = req.params;
    const hive = await Hive.findByPk(id, {
      include: [
        { model: Apiary, as: 'apiary' },
        { model: SensorReading, as: 'sensorReadings', limit: 30, order: [['timestamp', 'DESC']] },
        { model: CameraObservation, as: 'cameraObservations', limit: 10, order: [['timestamp', 'DESC']] },
        { model: HealthScore, as: 'healthScores', limit: 10, order: [['calculated_at', 'DESC']] },
        { model: RiskPrediction, as: 'riskPredictions', limit: 5, order: [['predicted_at', 'DESC']] },
        { model: Recommendation, as: 'recommendations', limit: 5, order: [['generated_at', 'DESC']] },
        { model: QueenHistory, as: 'queenHistories', limit: 10, order: [['observation_date', 'DESC']] },
        { model: BroodObservation, as: 'broodObservations', limit: 10, order: [['observation_date', 'DESC']] },
        {
          model: BeekeeperAction,
          as: 'actions',
          include: [{ model: RecoveryRecord, as: 'recoveryRecords' }],
          order: [['action_date', 'DESC']]
        },
        {
          model: HoneyBatch,
          as: 'batches',
          include: [{ model: BlockchainRecord, as: 'blockchainRecord' }],
          order: [['harvest_date', 'DESC']]
        }
      ]
    });

    if (!hive) {
      return res.status(404).json({ error: 'Hive not found.' });
    }

    res.json({ hive });
  } catch (error) {
    console.error('getHiveById error:', error);
    res.status(500).json({ error: 'Failed to fetch hive details.' });
  }
};

exports.getHivePassport = async (req, res) => {
  try {
    const { id } = req.params;
    const hive = await Hive.findByPk(id, {
      include: [
        { model: Apiary, as: 'apiary', include: [{ model: Beekeeper, as: 'beekeeper' }] },
        { model: QueenHistory, as: 'queenHistories', order: [['observation_date', 'ASC']] },
        { model: BroodObservation, as: 'broodObservations', order: [['observation_date', 'ASC']] },
        { model: HealthScore, as: 'healthScores', order: [['calculated_at', 'ASC']] },
        { model: RiskPrediction, as: 'riskPredictions', order: [['predicted_at', 'DESC']] },
        {
          model: BeekeeperAction,
          as: 'actions',
          include: [{ model: RecoveryRecord, as: 'recoveryRecords' }],
          order: [['action_date', 'ASC']]
        },
        {
          model: HoneyBatch,
          as: 'batches',
          include: [{ model: BlockchainRecord, as: 'blockchainRecord' }],
          order: [['harvest_date', 'DESC']]
        }
      ]
    });

    if (!hive) {
      return res.status(404).json({ error: 'Hive not found.' });
    }

    // Compile longitudinal Digital Passport payload
    const passport = {
      passport_id: `PASSPORT-${hive.hive_code}`,
      hive_code: hive.hive_code,
      installation_date: hive.installation_date,
      bee_species: hive.bee_species,
      box_type: hive.box_type,
      colony_strength: hive.colony_strength,
      queen_status: hive.queen_status,
      current_health_score: hive.current_health_score,
      current_risk_level: hive.current_risk_level,
      status: hive.status,
      apiary: {
        id: hive.apiary?.id,
        name: hive.apiary?.name,
        location: hive.apiary?.location_name,
        flora_type: hive.apiary?.flora_type,
        weather_zone: hive.apiary?.weather_zone
      },
      longitudinal_summary: {
        total_queen_observations: hive.queenHistories.length,
        total_brood_inspections: hive.broodObservations.length,
        total_actions_recorded: hive.actions.length,
        total_batches_harvested: hive.batches.length,
        total_honey_yield_kg: hive.batches.reduce((sum, b) => sum + (b.quantity_kg || 0), 0)
      },
      timeline: {
        queen_history: hive.queenHistories,
        brood_observations: hive.broodObservations,
        health_scores: hive.healthScores,
        predictions: hive.riskPredictions,
        actions_and_recoveries: hive.actions,
        batches: hive.batches
      },
      scientific_disclaimer: 'The Hive Digital Passport presents verified historical telemetry and management logs. It is not an absolute clinical guarantee of biological pathogen absence.'
    };

    res.json({ passport });
  } catch (error) {
    console.error('getHivePassport error:', error);
    res.status(500).json({ error: 'Failed to compile hive digital passport.' });
  }
};

exports.getApiaryCorrelation = async (req, res) => {
  try {
    const { apiaryId } = req.params;
    const apiary = await Apiary.findByPk(apiaryId, {
      include: [
        {
          model: Hive,
          as: 'hives',
          include: [
            {
              model: SensorReading,
              as: 'sensorReadings',
              limit: 5,
              order: [['timestamp', 'DESC']]
            }
          ]
        }
      ]
    });

    if (!apiary) {
      return res.status(404).json({ error: 'Apiary not found.' });
    }

    const hivesAnalysis = apiary.hives.map(hive => {
      const readings = hive.sensorReadings || [];
      const latest = readings[0] || {};
      const avgHumidity = readings.length > 0 ? readings.reduce((acc, r) => acc + r.humidity, 0) / readings.length : 60;
      const weightChange = latest.weight_delta_24h || 0;

      let anomalyNote = 'Normal parameters';
      let hasAnomaly = false;

      if (avgHumidity > 72) {
        anomalyNote = 'Elevated internal humidity';
        hasAnomaly = true;
      } else if (weightChange < -0.6) {
        anomalyNote = 'Marked weight decline';
        hasAnomaly = true;
      } else if (latest.net_bee_traffic < 18) {
        anomalyNote = 'Reduced foraging traffic';
        hasAnomaly = true;
      }

      return {
        hive_id: hive.id,
        hive_code: hive.hive_code,
        health_score: hive.current_health_score,
        risk_level: hive.current_risk_level,
        latest_temp: latest.temperature || 35.0,
        latest_humidity: latest.humidity || 55.0,
        latest_weight: latest.weight || 40.0,
        hasAnomaly,
        anomalyNote
      };
    });

    const anomalousCount = hivesAnalysis.filter(h => h.hasAnomaly).length;
    const hasCorrelatedPattern = anomalousCount >= 2;

    res.json({
      apiary_id: apiary.id,
      apiary_name: apiary.name,
      location: apiary.location_name,
      total_hives: apiary.hives.length,
      anomalous_hives_count: anomalousCount,
      pattern_detected: hasCorrelatedPattern,
      correlation_message: hasCorrelatedPattern
        ? 'Apiary-level abnormal pattern detected across multiple neighbouring hives.'
        : 'Micro-climate and colony telemetry indicate normal localized variation across hives.',
      recommendation: hasCorrelatedPattern
        ? 'Inspect affected hives and investigate common environmental or management factors (e.g., rainfall dampness, shared forage scarcity, or robbing pressure).'
        : 'Continue routine individual hive monitoring.',
      hives: hivesAnalysis,
      scientific_disclaimer: 'Apiary correlation identifies simultaneous statistical anomalies. It does not prove disease transmission.'
    });
  } catch (error) {
    console.error('getApiaryCorrelation error:', error);
    res.status(500).json({ error: 'Failed to analyze apiary correlation.' });
  }
};

exports.getApiaries = async (req, res) => {
  try {
    const apiaries = await Apiary.findAll({
      include: [{ model: Hive, as: 'hives' }]
    });
    res.json({ apiaries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apiaries.' });
  }
};
