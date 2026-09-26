const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActionSimulation = sequelize.define('ActionSimulation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  simulated_at: { type: DataTypes.DATE, allowNull: false },
  current_state_json: { type: DataTypes.TEXT },
  simulated_options_json: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = ActionSimulation;
