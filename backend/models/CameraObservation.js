const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CameraObservation = sequelize.define('CameraObservation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hive_id: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
  entrance_traffic_score: { type: DataTypes.FLOAT, defaultValue: 8.5 },
  pollen_carrying_ratio: { type: DataTypes.FLOAT, defaultValue: 0.45 },
  visual_abnormality_detected: { type: DataTypes.BOOLEAN, defaultValue: false },
  abnormality_type: { type: DataTypes.STRING },
  confidence: { type: DataTypes.FLOAT, defaultValue: 0.85 },
  source: { type: DataTypes.ENUM('iot_camera', 'manual_upload'), defaultValue: 'iot_camera' },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

module.exports = CameraObservation;
