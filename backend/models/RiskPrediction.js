const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiskPrediction = sequelize.define('RiskPrediction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  predicted_at: { type: DataTypes.DATE, allowNull: false },
  predicted_time_window: { type: DataTypes.STRING, defaultValue: '3-7 days' },
  confidence: { type: DataTypes.FLOAT, defaultValue: 0.75 },
  risk_level_predicted: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
  primary_factors_json: { type: DataTypes.TEXT },
  trajectory_json: { type: DataTypes.TEXT },
  model_version: { type: DataTypes.STRING, defaultValue: 'model_v1' }
}, { timestamps: true });

module.exports = RiskPrediction;
