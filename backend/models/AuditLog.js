const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entity_type: { type: DataTypes.STRING, allowNull: false },
  entity_id: { type: DataTypes.STRING },
  details_json: { type: DataTypes.TEXT },
  ip_address: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = AuditLog;
