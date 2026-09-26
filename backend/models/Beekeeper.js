const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Beekeeper = sequelize.define('Beekeeper', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  registration_no: { type: DataTypes.STRING, unique: true },
  state: { type: DataTypes.STRING },
  district: { type: DataTypes.STRING },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 1 },
  bio: { type: DataTypes.TEXT },
  certificates_json: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = Beekeeper;
