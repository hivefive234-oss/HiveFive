const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeekeeperAction = sequelize.define('BeekeeperAction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  beekeeper_id: { type: DataTypes.INTEGER },
  action_date: { type: DataTypes.DATEONLY, allowNull: false },
  action_type: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  condition_before: { type: DataTypes.TEXT },
  condition_after: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = BeekeeperAction;
