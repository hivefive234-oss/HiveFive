/**
 * HONEYCHAIN - IoT Hive Sensor Simulator
 * Emulates physical ESP32 nodes streaming multi-signal telemetry to the backend.
 * Demonstrates the 5 realistic colony conditions:
 *   H001: Healthy (optimum thermoregulation, steady flight)
 *   H002: Stable (normal seasonal performance)
 *   H003: Increasing Risk (rising moisture, declining flight)
 *   H004: High Risk (temperature dysregulation, high acoustic distress, weight drop)
 *   H005: Recovery (stabilizing metrics post-beekeeper intervention)
 */

const axios = require('../../backend/node_modules/axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/sensors/iot';
const INTERVAL_SECONDS = 5;

const PROFILES = {
  H001: {
    code: 'H001',
    label: 'Healthy Colony',
    tempBase: 34.8,
    humidityBase: 56.0,
    weightBase: 44.2,
    weightDelta: +0.25,
    acousticHz: 236,
    trafficBase: 68
  },
  H002: {
    code: 'H002',
    label: 'Stable Colony',
    tempBase: 35.1,
    humidityBase: 58.5,
    weightBase: 42.0,
    weightDelta: +0.05,
    acousticHz: 242,
    trafficBase: 54
  },
  H003: {
    code: 'H003',
    label: 'Increasing Risk Colony',
    tempBase: 36.4,
    humidityBase: 76.8,
    weightBase: 40.5,
    weightDelta: -0.45,
    acousticHz: 275,
    trafficBase: 32
  },
  H004: {
    code: 'H004',
    label: 'High Risk Colony',
    tempBase: 38.6,
    humidityBase: 82.5,
    weightBase: 37.8,
    weightDelta: -1.20,
    acousticHz: 345,
    trafficBase: 12
  },
  H005: {
    code: 'H005',
    label: 'Recovering Colony',
    tempBase: 35.2,
    humidityBase: 62.0,
    weightBase: 40.8,
    weightDelta: +0.35,
    acousticHz: 240,
    trafficBase: 48
  }
};

let tickCount = 0;

async function sendTelemetry(profile) {
  const jitterT = (Math.random() - 0.5) * 0.3;
  const jitterH = (Math.random() - 0.5) * 1.2;
  const jitterW = (Math.random() - 0.5) * 0.05;

  const temp = parseFloat((profile.tempBase + jitterT).toFixed(1));
  const hum = parseFloat((profile.humidityBase + jitterH).toFixed(1));
  const weight = parseFloat((profile.weightBase + profile.weightDelta * (tickCount * 0.01) + jitterW).toFixed(2));
  const trafficIn = Math.round(profile.trafficBase / 2 + (Math.random() * 4 - 2));
  const trafficOut = Math.round(profile.trafficBase / 2 + (Math.random() * 4 - 2));

  const payload = {
    device_id: `ESP32-HV-${profile.code}`,
    hive_id: profile.code,
    timestamp: Math.floor(Date.now() / 1000),
    temperature: temp,
    humidity: hum,
    weight: weight,
    acoustic: {
      frequency_peak_hz: profile.acousticHz + Math.round(Math.random() * 4 - 2),
      amplitude_db: -18.2
    },
    activity: {
      bee_count_in: Math.max(0, trafficIn),
      bee_count_out: Math.max(0, trafficOut)
    },
    battery_v: 4.12,
    ambient: {
      temp: 27.5,
      humidity: 62.0
    },
    is_simulated: true
  };

  try {
    const res = await axios.post(BACKEND_URL, payload);
    console.log(
      `[SIMULATOR] [${profile.code}] ${profile.label.padEnd(22)} | Temp: ${temp}°C | Hum: ${hum}% | Wt: ${weight}kg | Health: ${res.data.health_score}/100 [${res.data.risk_level}]`
    );
  } catch (err) {
    console.error(`[SIMULATOR ERROR] Failed to send telemetry for ${profile.code}:`, err.message);
  }
}

async function runSimulatorCycle() {
  tickCount++;
  console.log(`\n--- IoT Simulation Cycle #${tickCount} [${new Date().toLocaleTimeString()}] ---`);
  for (const key of Object.keys(PROFILES)) {
    await sendTelemetry(PROFILES[key]);
  }
}

console.log('=====================================================');
console.log('  HONEYCHAIN - IoT ESP32 SENSOR SIMULATOR DEMO');
console.log('=====================================================');
console.log(`Target Backend: ${BACKEND_URL}`);
console.log(`Simulating H001..H005 at ${INTERVAL_SECONDS}s intervals.`);
console.log('Press Ctrl+C to stop.\n');

runSimulatorCycle();
setInterval(runSimulatorCycle, INTERVAL_SECONDS * 1000);
