const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QueenHistory = sequelize.define('QueenHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  observation_date: { type: DataTypes.DATEONLY, allowNull: false },
  queen_seen: { type: DataTypes.BOOLEAN, defaultValue: false },
  queen_status_label: { type: DataTypes.STRING, defaultValue: 'Stable queen-related indicators' },
  brood_pattern_score: { type: DataTypes.INTEGER, defaultValue: 8 },
  laying_rate_estimate: { type: DataTypes.STRING, defaultValue: 'Normal' },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = QueenHistory;
