const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketListing = sequelize.define('MarketListing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  is_listed: { type: DataTypes.BOOLEAN, defaultValue: true },
  price_per_kg: { type: DataTypes.FLOAT, defaultValue: 650.0 },
  available_units: { type: DataTypes.INTEGER, defaultValue: 25 },
  description: { type: DataTypes.TEXT },
  certificates_json: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = MarketListing;
