const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlockchainRecord = sequelize.define('BlockchainRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  canonical_hash: { type: DataTypes.STRING, allowNull: false },
  tx_hash: { type: DataTypes.STRING, allowNull: false },
  block_number: { type: DataTypes.INTEGER, defaultValue: 101 },
  contract_address: { type: DataTypes.STRING, defaultValue: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
  chain_id: { type: DataTypes.INTEGER, defaultValue: 31337 },
  status: { type: DataTypes.ENUM('CONFIRMED', 'PENDING', 'FAILED'), defaultValue: 'CONFIRMED' },
  timestamp: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = BlockchainRecord;
