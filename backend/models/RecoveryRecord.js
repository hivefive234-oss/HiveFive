const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecoveryRecord = sequelize.define('RecoveryRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action_id: { type: DataTypes.INTEGER, allowNull: false },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  follow_up_date: { type: DataTypes.DATEONLY, allowNull: false },
  health_score: { type: DataTypes.FLOAT, defaultValue: 75.0 },
  condition_status: { type: DataTypes.ENUM('recovering', 'stable', 'declining'), defaultValue: 'stable' },
  outcome_notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = RecoveryRecord;
