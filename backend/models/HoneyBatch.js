const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoneyBatch = sequelize.define('HoneyBatch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  apiary_id: { type: DataTypes.INTEGER, allowNull: false },
  beekeeper_id: { type: DataTypes.INTEGER, allowNull: false },
  harvest_date: { type: DataTypes.DATEONLY, allowNull: false },
  quantity_kg: { type: DataTypes.FLOAT, allowNull: false },
  honey_type: { type: DataTypes.STRING, defaultValue: 'Multifloral Raw Honey' },
  moisture_percentage: { type: DataTypes.FLOAT, defaultValue: 17.5 },
  floral_source: { type: DataTypes.STRING, defaultValue: 'Wild Forest Bloom' },
  processing_method: { type: DataTypes.STRING, defaultValue: 'Cold extracted, coarse filtered' },
  packaging_date: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('HARVESTED', 'PROCESSING', 'PACKAGED', 'VERIFIED'), defaultValue: 'HARVESTED' },
  canonical_hash: { type: DataTypes.STRING },
  tx_hash: { type: DataTypes.STRING },
  qr_code_url: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = HoneyBatch;
