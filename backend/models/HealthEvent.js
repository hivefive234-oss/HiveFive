const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthEvent = sequelize.define('HealthEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  event_type: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.ENUM('info', 'warning', 'critical'), defaultValue: 'info' },
  description: { type: DataTypes.TEXT, allowNull: false },
  triggered_by_sensor: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = HealthEvent;
