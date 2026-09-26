const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorReading = sequelize.define('SensorReading', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  device_id: { type: DataTypes.STRING, defaultValue: 'ESP32-HV-001' },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  temperature: { type: DataTypes.FLOAT, allowNull: false },
  humidity: { type: DataTypes.FLOAT, allowNull: false },
  weight: { type: DataTypes.FLOAT, allowNull: false },
  weight_delta_24h: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  acoustic_peak_hz: { type: DataTypes.FLOAT, defaultValue: 235.0 },
  acoustic_amplitude_db: { type: DataTypes.FLOAT, defaultValue: -18.0 },
  bee_activity_in: { type: DataTypes.INTEGER, defaultValue: 30 },
  bee_activity_out: { type: DataTypes.INTEGER, defaultValue: 32 },
  net_bee_traffic: { type: DataTypes.INTEGER, defaultValue: 62 },
  battery_v: { type: DataTypes.FLOAT, defaultValue: 4.1 },
  ambient_temp: { type: DataTypes.FLOAT, defaultValue: 28.0 },
  ambient_humidity: { type: DataTypes.FLOAT, defaultValue: 60.0 },
  is_simulated: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true, indexes: [{ fields: ['hive_id', 'timestamp'] }] });

module.exports = SensorReading;
