const axios = require('axios');
const config = require('../config/config');

class MLClient {
  constructor() {
    this.baseUrl = config.ML_SERVICE_URL;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 3000
    });
  }

  async predictHealth(payload) {
    try {
      const response = await this.client.post('/predict/health', payload);
      return response.data;
    } catch (err) {
      // Graceful fallback to embedded colony-level decision support engine
      return this.localHealthPrediction(payload);
    }
  }

  async predictTrajectory(payload) {
    try {
      const response = await this.client.post('/predict/trajectory', payload);
      return response.data;
    } catch (err) {
      return this.localTrajectoryPrediction(payload);
    }
  }

  async explain(payload) {
    try {
      const response = await this.client.post('/explain', payload);
      return response.data;
    } catch (err) {
      return this.localExplain(payload);
    }
  }

  async simulateAction(payload) {
    try {
      const response = await this.client.post('/simulate-action', payload);
      return response.data;
    } catch (err) {
      return this.localSimulateAction(payload);
    }
  }

  async predictProductionImpact(payload) {
    try {
      const response = await this.client.post('/predict/production-impact', payload);
      return response.data;
    } catch (err) {
      return this.localProductionImpact(payload);
    }
  }

  async getModelMetadata() {
    try {
      const response = await this.client.get('/model/metadata');
      return response.data;
    } catch (err) {
      return {
        model_name: 'HoneyChain Colony Health Engine (Fallback Mode)',
        version: 'model_v1-integrated',
        mode: 'demo',
        training_date: '2026-09-01',
        dataset_version: 'synth_timeseries_v1.2',
        status: 'active'
      };
    }
  }

  // --- Local Decision Support Fallback Logic ---
  localHealthPrediction({ temperature, humidity, weight, weight_delta_24h, acoustic_peak_hz, net_bee_traffic }) {
    let score = 90;
    const factors = [];

    // Optimal brood nest temp: 34.5°C - 35.5°C
    if (temperature < 32.0 || temperature > 37.5) {
      const penalty = Math.min(30, Math.abs(temperature - 35.0) * 8);
      score -= penalty;
      factors.push(`Brood nest temperature dysregulation (${temperature.toFixed(1)}°C outside optimal 34.5–35.5°C)`);
    }

    // Optimal humidity: 50% - 65%
    if (humidity > 75.0) {
      score -= 15;
      factors.push(`Excess internal humidity (${humidity.toFixed(1)}% RH, potential dampness/ventilation issue)`);
    } else if (humidity < 40.0) {
      score -= 10;
      factors.push(`Low internal humidity (${humidity.toFixed(1)}% RH)`);
    }

    // Weight delta
    if (weight_delta_24h < -0.8) {
      score -= 20;
      factors.push(`Rapid colony weight drop (${weight_delta_24h.toFixed(2)} kg in 24h, possible resource depletion or robbing)`);
    } else if (weight_delta_24h < -0.2) {
      score -= 8;
      factors.push(`Mild daily weight decrease (${weight_delta_24h.toFixed(2)} kg)`);
    }

    // Acoustic baseline: 220Hz - 260Hz normal buzzing
    if (acoustic_peak_hz > 300) {
      score -= 15;
      factors.push(`Elevated high-frequency acoustic distress (${Math.round(acoustic_peak_hz)} Hz, potential agitation or queen issue)`);
    } else if (acoustic_peak_hz < 150 && net_bee_traffic > 20) {
      score -= 10;
      factors.push(`Abnormally subdued acoustic response (${Math.round(acoustic_peak_hz)} Hz)`);
    }

    // Traffic
    if (net_bee_traffic < 15) {
      score -= 10;
      factors.push(`Reduced entrance activity (${net_bee_traffic} flights/min)`);
    }

    score = Math.max(10, Math.min(100, Math.round(score)));

    let riskLevel = 'LOW';
    let trend = 'STABLE';

    if (score < 60) {
      riskLevel = 'HIGH';
      trend = 'DECLINING';
    } else if (score < 75) {
      riskLevel = 'MEDIUM';
      trend = 'DECLINING';
    } else if (score >= 85) {
      trend = 'IMPROVING';
    }

    return {
      mode: 'demo',
      model_version: 'model_v1',
      healthScore: score,
      riskLevel,
      trend,
      confidence: 0.82,
      factors: factors.length > 0 ? factors : ['Colony vital metrics remain within healthy baseline ranges']
    };
  }

  localTrajectoryPrediction({ currentScore, trend, riskLevel }) {
    let window = 'Normal monitoring schedule';
    let confidence = 0.78;
    let projection = 'Colony expected to maintain stable performance under standard forage conditions.';

    if (riskLevel === 'HIGH' || trend === 'DECLINING') {
      window = '3–7 days';
      confidence = 0.72;
      projection = 'If the current abnormal trend continues without intervention, colony condition may reach severe stress threshold within 3–7 days.';
    } else if (riskLevel === 'MEDIUM') {
      window = '7–14 days';
      confidence = 0.68;
      projection = 'Colony exhibits mild instability. If environmental or internal stressors persist, condition may deteriorate over the next 1–2 weeks.';
    }

    return {
      mode: 'demo',
      estimatedRiskWindow: window,
      confidence,
      projectionSummary: projection,
      trajectoryPoints: [
        { day: 'Day 0 (Now)', score: currentScore },
        { day: 'Day 2', score: Math.max(20, currentScore - (trend === 'DECLINING' ? 6 : 0)) },
        { day: 'Day 4', score: Math.max(15, currentScore - (trend === 'DECLINING' ? 12 : 0)) },
        { day: 'Day 7', score: Math.max(10, currentScore - (trend === 'DECLINING' ? 18 : 0)) }
      ]
    };
  }

  localExplain({ healthScore, riskLevel, factors, hiveCode }) {
    const whatHappened = riskLevel === 'LOW'
      ? `Hive ${hiveCode || ''} exhibits steady thermoregulation and healthy foraging flight activity.`
      : `Multimodal telemetry detected abnormal departures from historical baseline metrics over recent intervals.`;

    const whyIncreasing = factors && factors.length > 0
      ? `Primary contributors: ${factors.join('; ')}.`
      : 'Colony sensor trends have remained aligned with expected seasonal benchmarks.';

    const dataCausedAlert = factors && factors.length > 0
      ? factors
      : ['No alert thresholds breached.'];

    const whatMayHappen = riskLevel === 'HIGH'
      ? 'If unattended, persistent thermal instability and weight decline may compromise brood survival and reduce adult workforce.'
      : (riskLevel === 'MEDIUM'
        ? 'Colony vigor may plateau or decline, potentially dampening upcoming honey yield.'
        : 'Colony is expected to continue normal foraging and nectar processing.');

    const whatToCheckNext = riskLevel === 'HIGH'
      ? 'Perform immediate targeted inspection: verify brood pattern regularity, check for queen presence/eggs, evaluate supplemental feed stores, and check hive ventilation.'
      : (riskLevel === 'MEDIUM'
        ? 'Inspect bottom board, verify entrance reducer airflow, and check food reserves during next routine check.'
        : 'Continue routine bi-weekly inspection schedule and verify water source proximity.');

    return {
      whatHappened,
      whyIsRiskIncreasing: whyIncreasing,
      dataCausedAlert,
      whatMayHappenIfTrendContinues: whatMayHappen,
      whatShouldBeekeeperCheckNext: whatToCheckNext,
      scientificDisclaimer: 'This analysis is a model-estimated decision support indicator based on multi-sensor patterns. It does not replace hands-on beekeeper inspection or chemical/veterinary diagnosis.'
    };
  }

  localSimulateAction({ currentScore, trend }) {
    return {
      currentState: {
        healthScore: currentScore,
        trend
      },
      options: [
        {
          id: 'OPTION_A',
          title: 'Option A – Continue Monitoring',
          description: 'Maintain passive telemetry monitoring without opening the hive box.',
          expectedHealthTrend: trend === 'DECLINING' ? 'Continued decline if underlying stressor persists' : 'Stable trajectory',
          possibleRiskChange: trend === 'DECLINING' ? 'Risk may escalate from MEDIUM to HIGH within 5-7 days' : 'Minimal risk change',
          productionImpactKg: trend === 'DECLINING' ? -3.5 : 0.0,
          monitoringRequirement: 'Check sensor telemetry dashboard every 12 hours',
          uncertainty: 'Moderate-High (internal condition remains unverified)'
        },
        {
          id: 'OPTION_B',
          title: 'Option B – Inspect Hive',
          description: 'Perform a hands-on physical inspection of brood frames, queen indicators, and feed reserves.',
          expectedHealthTrend: 'Enables targeted diagnosis and timely corrective action',
          possibleRiskChange: 'Reduces diagnostic uncertainty by ~65%',
          productionImpactKg: -0.5,
          monitoringRequirement: 'Log inspection findings, brood pattern uniformity, and queen status in passport',
          uncertainty: 'Low (direct observational verification)'
        },
        {
          id: 'OPTION_C',
          title: 'Option C – Appropriate Domain Intervention',
          description: 'Apply non-chemical corrective management (e.g. adjust ventilation screen, provide sugar syrup/protein patty, add super frame).',
          expectedHealthTrend: 'Potential stabilization and progressive score recovery within 4–8 days',
          possibleRiskChange: 'Estimated 40–60% reduction in high-risk escalation probability',
          productionImpactKg: +2.0,
          monitoringRequirement: 'Monitor daily weight and temperature stabilization over subsequent 7 days',
          uncertainty: 'Moderate (dependent on accurate problem identification)'
        },
        {
          id: 'OPTION_D',
          title: 'Option D – Recheck After Short Interval',
          description: 'Defer physical disruption for 24-48 hours while tracking hourly rate-of-change.',
          expectedHealthTrend: 'Provides confirmation whether anomaly is transient weather shock or chronic decline',
          possibleRiskChange: 'Accepts temporary risk window to prevent unnecessary hive disturbance',
          productionImpactKg: -1.0,
          monitoringRequirement: 'Automated notification if temperature departs by >2°C from baseline',
          uncertainty: 'Moderate'
        }
      ],
      disclaimer: 'Action simulator provides comparative decision-support projections. Do not apply chemical treatments without certified veterinary/agricultural diagnosis.'
    };
  }

  localProductionImpact({ expectedBaselineKg = 24.0, healthScore = 75, weightTrend = 'stable' }) {
    let lossFactor = 0.0;
    if (healthScore < 50) {
      lossFactor = 0.40;
    } else if (healthScore < 70) {
      lossFactor = 0.22;
    } else if (healthScore < 85) {
      lossFactor = 0.08;
    }

    const estimatedYield = parseFloat((expectedBaselineKg * (1 - lossFactor)).toFixed(1));
    const potentialDifference = parseFloat((expectedBaselineKg - estimatedYield).toFixed(1));

    return {
      expectedProductionKg: expectedBaselineKg,
      currentEstimatedProductionKg: estimatedYield,
      potentialDifferenceKg: potentialDifference,
      confidence: 0.76,
      contributingFactors: [
        `Colony vigor index: ${healthScore}/100`,
        `Recent 7-day weight velocity: ${weightTrend}`,
        'Seasonal nectar flow estimate'
      ],
      disclaimer: 'Production projections are statistical estimates based on historical colony strength and sensor telemetry. Not a guaranteed harvest volume.'
    };
  }
}

module.exports = new MLClient();
