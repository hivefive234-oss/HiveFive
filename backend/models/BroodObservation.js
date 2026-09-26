const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BroodObservation = sequelize.define('BroodObservation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  observation_date: { type: DataTypes.DATEONLY, allowNull: false },
  pattern_uniformity: { type: DataTypes.INTEGER, defaultValue: 8 },
  capped_brood_percent: { type: DataTypes.FLOAT, defaultValue: 70.0 },
  eggs_present: { type: DataTypes.BOOLEAN, defaultValue: true },
  larvae_present: { type: DataTypes.BOOLEAN, defaultValue: true },
  drone_brood_ratio: { type: DataTypes.FLOAT, defaultValue: 5.0 },
  signs_of_disease: { type: DataTypes.STRING, defaultValue: 'None observed' },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = BroodObservation;
