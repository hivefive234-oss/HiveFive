const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('beekeeper', 'admin', 'kvic'), defaultValue: 'beekeeper' },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'approved' },
  full_name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  organization: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = User;
