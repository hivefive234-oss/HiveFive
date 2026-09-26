const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeeImage = sequelize.define('BeeImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  file_path: { type: DataTypes.STRING, allowNull: false },
  captured_at: { type: DataTypes.DATE, allowNull: false },
  source: { type: DataTypes.STRING, defaultValue: 'manual_upload' },
  description: { type: DataTypes.TEXT },
  tags_json: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = BeeImage;
