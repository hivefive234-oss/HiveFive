const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recommendation = sequelize.define('Recommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  generated_at: { type: DataTypes.DATE, allowNull: false },
  recommendation_text: { type: DataTypes.TEXT, allowNull: false },
  explanation_json: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  is_acknowledged: { type: DataTypes.BOOLEAN, defaultValue: false },
  acknowledged_at: { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = Recommendation;
