const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BatchEvent = sequelize.define('BatchEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.STRING, allowNull: false },
  event_type: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  notes: { type: DataTypes.TEXT },
  operator: { type: DataTypes.STRING, defaultValue: 'Certified Beekeeper' }
}, { timestamps: true });

module.exports = BatchEvent;
