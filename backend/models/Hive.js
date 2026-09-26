const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hive = sequelize.define('Hive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  apiary_id: { type: DataTypes.INTEGER, allowNull: false },
  bee_species: { type: DataTypes.STRING, defaultValue: 'Apis cerana indica' },
  box_type: { type: DataTypes.STRING, defaultValue: 'Langstroth Standard' },
  installation_date: { type: DataTypes.DATEONLY, allowNull: false },
  queen_status: { type: DataTypes.STRING, defaultValue: 'Stable queen-related indicators' },
  queen_introduced_date: { type: DataTypes.DATEONLY },
  colony_strength: { type: DataTypes.STRING, defaultValue: 'Strong' },
  status: { type: DataTypes.ENUM('active', 'quarantine', 'dormant', 'harvest_ready'), defaultValue: 'active' },
  current_health_score: { type: DataTypes.FLOAT, defaultValue: 85.0 },
  current_risk_level: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = Hive;
