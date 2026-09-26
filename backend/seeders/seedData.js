const bcrypt = require('bcryptjs');
const {
  User, Beekeeper, Apiary, Hive, QueenHistory, BroodObservation,
  SensorReading, CameraObservation, HealthScore, RiskPrediction,
  HealthEvent, Recommendation, ActionSimulation, BeekeeperAction,
  RecoveryRecord, HoneyBatch, BatchEvent, BlockchainRecord, QRCode, MarketListing
} = require('../models');
const { createCanonicalString, computeBatchHash } = require('../services/canonicalHash');
const { generateBatchQRCode } = require('../services/qrService');

async function seedDatabase(force = false) {
  try {
    const userCount = await User.count();
    if (userCount > 0 && !force) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding realistic HoneyChain demonstration dataset...');

    const salt = await bcrypt.genSalt(10);
    const beekeeperPass = await bcrypt.hash('password123', salt);
    const adminPass = await bcrypt.hash('admin123', salt);

    // 1. Users
    const beekeeperUser = await User.create({
      email: 'beekeeper@honeychain.io',
      password_hash: beekeeperPass,
      role: 'beekeeper',
      status: 'approved',
      full_name: 'User',
      phone: '+91 98450 12345',
      organization: 'Western Ghats Organic Honey FPO'
    });

    const adminUser = await User.create({
      email: 'admin@kvic.gov.in',
      password_hash: adminPass,
      role: 'admin',
      status: 'approved',
      full_name: 'KVIC Regional Director',
      phone: '+91 80 2345 6789',
      organization: 'Khadi & Village Industries Commission (KVIC)'
    });

    // 2. Beekeeper Profile
    await Beekeeper.create({
      user_id: beekeeperUser.id,
      registration_no: 'BK-KVIC-KA-2026-0881',
      state: 'Karnataka',
      district: 'Kodagu (Coorg)',
      experience_years: 9,
      bio: 'Practicing sustainable scientific apiculture across the Western Ghats biodiversity hotspot.',
      certificates_json: JSON.stringify(['KVIC Master Beekeeper', 'Organic Apiary Certification 2025'])
    });

    // 3. Apiaries
    const apiaryA = await Apiary.create({
      beekeeper_id: beekeeperUser.id,
      name: 'Coorg Shola Apiary A',
      location_name: 'Madikeri, Kodagu, Karnataka',
      latitude: 12.4244,
      longitude: 75.7382,
      elevation: 1050,
      flora_type: 'Wild Coffee, Cardamom & Jamun Blossom',
      weather_zone: 'Humid Montane Subtropical'
    });

    const apiaryB = await Apiary.create({
      beekeeper_id: beekeeperUser.id,
      name: 'Nilgiri Mist Apiary B',
      location_name: 'Kotagiri, Nilgiris, Tamil Nadu',
      latitude: 11.4285,
      longitude: 76.8833,
      elevation: 1790,
      flora_type: 'Mountain Eucalyptus & Wild Rhododendron',
      weather_zone: 'Temperate High-Altitude'
    });

    // 4. Hives (H001 through H005)
    const hivesData = [
      {
        hive_code: 'H001',
        apiary_id: apiaryA.id,
        bee_species: 'Apis cerana indica',
        box_type: 'Langstroth 10-Frame Standard',
        installation_date: '2025-10-15',
        queen_status: 'Stable queen-related indicators',
        colony_strength: 'Strong',
        status: 'active',
        current_health_score: 92.0,
        current_risk_level: 'LOW',
        notes: 'Exemplary thermoregulation, steady foraging flights, thriving brood area.'
      },
      {
        hive_code: 'H002',
        apiary_id: apiaryA.id,
        bee_species: 'Apis cerana indica',
        box_type: 'Langstroth 10-Frame Standard',
        installation_date: '2025-11-01',
        queen_status: 'Stable queen-related indicators',
        colony_strength: 'Moderate-Strong',
        status: 'active',
        current_health_score: 84.0,
        current_risk_level: 'LOW',
        notes: 'Consistent colony performance within expected baseline parameters.'
      },
      {
        hive_code: 'H003',
        apiary_id: apiaryA.id,
        bee_species: 'Apis cerana indica',
        box_type: 'Langstroth 10-Frame Standard',
        installation_date: '2025-11-20',
        queen_status: 'Inspection recommended',
        colony_strength: 'Moderate',
        status: 'active',
        current_health_score: 68.0,
        current_risk_level: 'MEDIUM',
        notes: 'Increasing internal humidity and mild temperature instability observed over last 72 hours.'
      },
      {
        hive_code: 'H004',
        apiary_id: apiaryB.id,
        bee_species: 'Apis mellifera',
        box_type: 'Langstroth Standard',
        installation_date: '2025-08-10',
        queen_status: 'Possible queen-related concern',
        colony_strength: 'Weakened',
        status: 'quarantine',
        current_health_score: 48.0,
        current_risk_level: 'HIGH',
        notes: 'Pronounced temperature dysregulation (>38°C), weight drop, and elevated acoustic buzzing.'
      },
      {
        hive_code: 'H005',
        apiary_id: apiaryB.id,
        bee_species: 'Apis mellifera',
        box_type: 'Langstroth Standard',
        installation_date: '2025-09-05',
        queen_status: 'Stable queen-related indicators',
        colony_strength: 'Recovering',
        status: 'active',
        current_health_score: 78.0,
        current_risk_level: 'LOW',
        notes: 'Demonstrating positive recovery post-ventilation adjustment and brood inspection.'
      }
    ];

    const hives = {};
    for (const h of hivesData) {
      hives[h.hive_code] = await Hive.create(h);
    }

    // 5. Queen History & Brood Observations
    for (const [code, hive] of Object.entries(hives)) {
      await QueenHistory.create({
        hive_id: hive.id,
        observation_date: '2026-09-15',
        queen_seen: true,
        queen_status_label: hive.queen_status,
        brood_pattern_score: code === 'H004' ? 4 : (code === 'H003' ? 6 : 9),
        laying_rate_estimate: code === 'H004' ? 'Irregular / Spotty' : 'Solid concentric rings',
        notes: code === 'H004'
          ? 'Spotty brood pattern detected; recommended checking for supersedure cells.'
          : 'Healthy concentric egg laying and steady royal pheromone acceptance.'
      });

      await BroodObservation.create({
        hive_id: hive.id,
        observation_date: '2026-09-15',
        pattern_uniformity: code === 'H004' ? 5 : (code === 'H003' ? 7 : 9),
        capped_brood_percent: code === 'H004' ? 45.0 : 78.0,
        eggs_present: true,
        larvae_present: true,
        drone_brood_ratio: code === 'H004' ? 14.0 : 4.5,
        signs_of_disease: 'No visual foulbrood or chalkbrood symptoms observed',
        notes: 'Routine observational inspection logged.'
      });
    }

    // 6. Generate Time-Series Sensor Readings (past 48 hours for each hive)
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now - i * 2 * 3600 * 1000); // every 2 hours

      // H001 Healthy
      await SensorReading.create({
        hive_id: hives['H001'].id,
        device_id: 'ESP32-HV-H001',
        timestamp,
        temperature: parseFloat((34.8 + Math.sin(i / 3) * 0.3).toFixed(1)),
        humidity: parseFloat((56.0 + Math.cos(i / 2) * 1.5).toFixed(1)),
        weight: parseFloat((44.0 + (24 - i) * 0.03).toFixed(2)),
        weight_delta_24h: 0.25,
        acoustic_peak_hz: 236.0,
        acoustic_amplitude_db: -18.2,
        bee_activity_in: 34,
        bee_activity_out: 36,
        net_bee_traffic: 70,
        battery_v: 4.15,
        ambient_temp: 26.5,
        ambient_humidity: 62.0,
        is_simulated: true
      });

      // H003 Increasing Risk (Humidity climbing, slight temp fluctuation)
      await SensorReading.create({
        hive_id: hives['H003'].id,
        device_id: 'ESP32-HV-H003',
        timestamp,
        temperature: parseFloat((36.2 + (24 - i) * 0.05).toFixed(1)),
        humidity: parseFloat((70.0 + (24 - i) * 0.35).toFixed(1)),
        weight: parseFloat((41.5 - (24 - i) * 0.02).toFixed(2)),
        weight_delta_24h: -0.45,
        acoustic_peak_hz: 275.0,
        acoustic_amplitude_db: -16.5,
        bee_activity_in: 16,
        bee_activity_out: 16,
        net_bee_traffic: 32,
        battery_v: 4.05,
        ambient_temp: 27.0,
        ambient_humidity: 78.0,
        is_simulated: true
      });

      // H004 High Risk (High temp, high humidity, sharp weight decline)
      await SensorReading.create({
        hive_id: hives['H004'].id,
        device_id: 'ESP32-HV-H004',
        timestamp,
        temperature: parseFloat((38.0 + Math.sin(i) * 0.5).toFixed(1)),
        humidity: parseFloat((82.0 + Math.cos(i) * 1.0).toFixed(1)),
        weight: parseFloat((38.0 - (24 - i) * 0.06).toFixed(2)),
        weight_delta_24h: -1.20,
        acoustic_peak_hz: 342.0,
        acoustic_amplitude_db: -13.0,
        bee_activity_in: 6,
        bee_activity_out: 7,
        net_bee_traffic: 13,
        battery_v: 3.92,
        ambient_temp: 29.5,
        ambient_humidity: 80.0,
        is_simulated: true
      });

      // H005 Recovery (Stabilizing towards 35°C)
      await SensorReading.create({
        hive_id: hives['H005'].id,
        device_id: 'ESP32-HV-H005',
        timestamp,
        temperature: parseFloat((35.8 - (24 - i) * 0.025).toFixed(1)),
        humidity: parseFloat((66.0 - (24 - i) * 0.15).toFixed(1)),
        weight: parseFloat((40.2 + (24 - i) * 0.02).toFixed(2)),
        weight_delta_24h: 0.35,
        acoustic_peak_hz: 242.0,
        acoustic_amplitude_db: -18.0,
        bee_activity_in: 24,
        bee_activity_out: 25,
        net_bee_traffic: 49,
        battery_v: 4.10,
        ambient_temp: 25.0,
        ambient_humidity: 64.0,
        is_simulated: true
      });
    }

    // 7. Health Scores & Predictions
    await HealthScore.create({
      hive_id: hives['H003'].id,
      calculated_at: new Date(),
      score: 68.0,
      risk_level: 'MEDIUM',
      trend: 'DECLINING',
      contributing_factors_json: JSON.stringify([
        'Internal humidity increased significantly (>76% RH)',
        'Mild hive weight decrease observed (-0.45 kg in 24h)',
        'Entrance flight activity reduced by ~40% compared to colony baseline'
      ])
    });

    await RiskPrediction.create({
      hive_id: hives['H003'].id,
      predicted_at: new Date(),
      predicted_time_window: '3–7 days',
      confidence: 0.72,
      risk_level_predicted: 'HIGH',
      primary_factors_json: JSON.stringify([
        'Elevated dampness inside brood chamber',
        'Moderate acoustic frequency elevation (275 Hz)',
        'Weight plateau'
      ]),
      trajectory_json: JSON.stringify([
        { day: 'Day 0 (Now)', score: 68 },
        { day: 'Day 2', score: 62 },
        { day: 'Day 4', score: 55 },
        { day: 'Day 7', score: 48 }
      ])
    });

    await Recommendation.create({
      hive_id: hives['H003'].id,
      generated_at: new Date(),
      recommendation_text: 'Inspect hive entrance ventilation screen and evaluate brood chamber moisture. Check food availability and inspect for signs of mold or pest infiltration.',
      explanation_json: JSON.stringify({
        what_happened: 'Internal relative humidity rose to 76.5% with simultaneous reduction in flight activity.',
        why_increasing: 'Moisture buildup impedes nectar curing and stresses the cluster thermo-regulation.',
        data_caused_alert: ['Humidity 76.5%', 'Weight delta -0.45 kg', 'Traffic 32 flights/min'],
        what_may_happen: 'Colony may enter high-risk stress state within 3–7 days if ventilation remains impeded.',
        what_to_check: 'Check bottom board moisture, clean entrance reducer, inspect capped honey reserves.'
      }),
      priority: 'high'
    });

    // 8. Action and Recovery Tracking on H005
    const actionH005 = await BeekeeperAction.create({
      hive_id: hives['H005'].id,
      beekeeper_id: beekeeperUser.id,
      action_date: '2026-09-17',
      action_type: 'Ventilation Adjustment & Moisture Management',
      reason: 'Elevated humidity (>78%) and stagnant acoustic hum noticed during inspection.',
      condition_before: 'Health Score: 55, Risk: HIGH, Cluster clustered tightly near top lid.',
      condition_after: 'Screen bottom board cleared; upper entrance wedge installed to assist air outflow.',
      notes: 'No chemical applied. Physical ventilation improved.'
    });

    await RecoveryRecord.create({
      action_id: actionH005.id,
      hive_id: hives['H005'].id,
      follow_up_date: '2026-09-21',
      health_score: 78.0,
      condition_status: 'recovering',
      outcome_notes: 'Brood temperature stabilized to 35.2°C; humidity down to 62%; active foraging resumed.'
    });

    // 9. Honey Batches, Blockchain Records & QR Codes
    // Batch 1 (Verified from H001)
    const batch1Id = 'HC-2026-001';
    const canonicalStr1 = createCanonicalString({
      batch_id: batch1Id,
      hive_code: 'H001',
      harvest_date: '2026-09-18',
      quantity_kg: 24.5,
      location_name: apiaryA.location_name,
      floral_source: 'Multifloral Raw Honey',
      moisture_percentage: 17.2
    });
    const hash1 = computeBatchHash(canonicalStr1);
    const qr1 = await generateBatchQRCode(batch1Id);

    const batch1 = await HoneyBatch.create({
      batch_id: batch1Id,
      hive_id: hives['H001'].id,
      apiary_id: apiaryA.id,
      beekeeper_id: beekeeperUser.id,
      harvest_date: '2026-09-18',
      quantity_kg: 24.5,
      honey_type: 'Multifloral Raw Honey',
      moisture_percentage: 17.2,
      floral_source: 'Wild Forest Bloom',
      processing_method: 'Cold extracted, stainless centrifugal spinner, coarse mesh filtered (unheated)',
      packaging_date: '2026-09-20',
      status: 'VERIFIED',
      canonical_hash: hash1,
      tx_hash: '0x8f4c217e92bb1c6e43187a4192b0c3f58a9e8721c4355a2014b2d18476d05f32',
      qr_code_url: qr1.qrDataUrl
    });

    await BlockchainRecord.create({
      batch_id: batch1Id,
      canonical_hash: hash1,
      tx_hash: batch1.tx_hash,
      block_number: 14289,
      contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      chain_id: 31337,
      status: 'CONFIRMED',
      timestamp: new Date('2026-09-20T10:30:00Z')
    });

    await QRCode.create({
      batch_id: batch1Id,
      qr_image_data: qr1.qrDataUrl,
      public_verification_url: qr1.verificationUrl,
      generated_at: new Date('2026-09-20T10:31:00Z')
    });

    await BatchEvent.create({
      batch_id: batch1Id,
      event_type: 'HARVEST',
      location: apiaryA.location_name,
      timestamp: new Date('2026-09-18T08:15:00Z'),
      notes: 'Clean harvest of 8 capped honey supers. Hive H001 in prime health.',
      operator: 'Lead Beekeeper'
    });

    await BatchEvent.create({
      batch_id: batch1Id,
      event_type: 'COLD_EXTRACTION',
      location: 'Coorg Cooperative Honey Processing Facility',
      timestamp: new Date('2026-09-11T14:00:00Z'),
      notes: 'Unheated centrifugal extraction at 24°C; moisture confirmed at 17.2% with refractometer.',
      operator: 'Certified QC Tech #14'
    });

    await BatchEvent.create({
      batch_id: batch1Id,
      event_type: 'BLOCKCHAIN_REGISTRATION',
      location: 'Ethereum Node (HoneyChain Smart Contract)',
      timestamp: new Date('2026-09-12T10:30:00Z'),
      notes: 'Canonical batch digest sealed on smart contract at block #14289.',
      operator: 'HoneyChain Smart Contract'
    });

    await MarketListing.create({
      batch_id: batch1Id,
      is_listed: true,
      price_per_kg: 750.0,
      available_units: 35,
      description: 'Single-source raw multifloral honey from the Western Ghats biodiversity hotspot.'
    });

    console.log('[Seed] Database populated successfully with realistic HoneyChain demonstration data.');
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
  }
}

module.exports = seedDatabase;

if (require.main === module) {
  const { sequelize } = require('../models');
  sequelize.sync({ force: true }).then(() => {
    seedDatabase(true).then(() => process.exit(0));
  });
}
