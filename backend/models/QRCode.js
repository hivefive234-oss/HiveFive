const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QRCode = sequelize.define('QRCode', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  qr_image_data: { type: DataTypes.TEXT, allowNull: false },
  public_verification_url: { type: DataTypes.STRING, allowNull: false },
  generated_at: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = QRCode;
