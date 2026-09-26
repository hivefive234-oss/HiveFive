const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Apiary = sequelize.define('Apiary', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  beekeeper_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  location_name: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT },
  elevation: { type: DataTypes.FLOAT },
  flora_type: { type: DataTypes.STRING },
  weather_zone: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = Apiary;
