const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthScore = sequelize.define('HealthScore', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  calculated_at: { type: DataTypes.DATE, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
  risk_level: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
  trend: { type: DataTypes.ENUM('IMPROVING', 'STABLE', 'DECLINING'), defaultValue: 'STABLE' },
  contributing_factors_json: { type: DataTypes.TEXT }
}, { timestamps: true, indexes: [{ fields: ['hive_id', 'calculated_at'] }] });

module.exports = HealthScore;
