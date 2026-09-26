const sequelize = require('../config/database');

const User = require('./User');
const Beekeeper = require('./Beekeeper');
const Apiary = require('./Apiary');
const Hive = require('./Hive');
const QueenHistory = require('./QueenHistory');
const BroodObservation = require('./BroodObservation');
const SensorReading = require('./SensorReading');
const CameraObservation = require('./CameraObservation');
const BeeImage = require('./BeeImage');
const HealthScore = require('./HealthScore');
const RiskPrediction = require('./RiskPrediction');
const HealthEvent = require('./HealthEvent');
const Recommendation = require('./Recommendation');
const ActionSimulation = require('./ActionSimulation');
const BeekeeperAction = require('./BeekeeperAction');
const RecoveryRecord = require('./RecoveryRecord');
const HoneyBatch = require('./HoneyBatch');
const BatchEvent = require('./BatchEvent');
const BlockchainRecord = require('./BlockchainRecord');
const QRCode = require('./QRCode');
const MarketListing = require('./MarketListing');
const AuditLog = require('./AuditLog');

// Define Relationships
// User <-> Beekeeper (1:1)
User.hasOne(Beekeeper, { foreignKey: 'user_id', as: 'beekeeperProfile', onDelete: 'CASCADE' });
Beekeeper.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Beekeeper <-> Apiary (1:N)
Beekeeper.hasMany(Apiary, { foreignKey: 'beekeeper_id', as: 'apiaries', onDelete: 'CASCADE' });
Apiary.belongsTo(Beekeeper, { foreignKey: 'beekeeper_id', as: 'beekeeper' });

// Apiary <-> Hive (1:N)
Apiary.hasMany(Hive, { foreignKey: 'apiary_id', as: 'hives', onDelete: 'CASCADE' });
Hive.belongsTo(Apiary, { foreignKey: 'apiary_id', as: 'apiary' });

// Hive <-> Longitudinal & Telemetry relations
Hive.hasMany(QueenHistory, { foreignKey: 'hive_id', as: 'queenHistories', onDelete: 'CASCADE' });
QueenHistory.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(BroodObservation, { foreignKey: 'hive_id', as: 'broodObservations', onDelete: 'CASCADE' });
BroodObservation.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(SensorReading, { foreignKey: 'hive_id', as: 'sensorReadings', onDelete: 'CASCADE' });
SensorReading.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(CameraObservation, { foreignKey: 'hive_id', as: 'cameraObservations', onDelete: 'CASCADE' });
CameraObservation.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(BeeImage, { foreignKey: 'hive_id', as: 'beeImages', onDelete: 'CASCADE' });
BeeImage.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(HealthScore, { foreignKey: 'hive_id', as: 'healthScores', onDelete: 'CASCADE' });
HealthScore.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(RiskPrediction, { foreignKey: 'hive_id', as: 'riskPredictions', onDelete: 'CASCADE' });
RiskPrediction.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(HealthEvent, { foreignKey: 'hive_id', as: 'healthEvents', onDelete: 'CASCADE' });
HealthEvent.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(Recommendation, { foreignKey: 'hive_id', as: 'recommendations', onDelete: 'CASCADE' });
Recommendation.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(ActionSimulation, { foreignKey: 'hive_id', as: 'actionSimulations', onDelete: 'CASCADE' });
ActionSimulation.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

Hive.hasMany(BeekeeperAction, { foreignKey: 'hive_id', as: 'actions', onDelete: 'CASCADE' });
BeekeeperAction.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

// BeekeeperAction <-> RecoveryRecord (1:N)
BeekeeperAction.hasMany(RecoveryRecord, { foreignKey: 'action_id', as: 'recoveryRecords', onDelete: 'CASCADE' });
RecoveryRecord.belongsTo(BeekeeperAction, { foreignKey: 'action_id', as: 'action' });
Hive.hasMany(RecoveryRecord, { foreignKey: 'hive_id', as: 'hiveRecoveryRecords', onDelete: 'CASCADE' });
RecoveryRecord.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });

// Hive <-> HoneyBatch (1:N)
Hive.hasMany(HoneyBatch, { foreignKey: 'hive_id', as: 'batches', onDelete: 'CASCADE' });
HoneyBatch.belongsTo(Hive, { foreignKey: 'hive_id', as: 'hive' });
Apiary.hasMany(HoneyBatch, { foreignKey: 'apiary_id', as: 'batches' });
HoneyBatch.belongsTo(Apiary, { foreignKey: 'apiary_id', as: 'apiary' });

// HoneyBatch <-> BatchEvent, BlockchainRecord, QRCode, MarketListing
HoneyBatch.hasMany(BatchEvent, { foreignKey: 'batch_id', sourceKey: 'batch_id', as: 'events', onDelete: 'CASCADE' });
BatchEvent.belongsTo(HoneyBatch, { foreignKey: 'batch_id', targetKey: 'batch_id', as: 'batch' });

HoneyBatch.hasOne(BlockchainRecord, { foreignKey: 'batch_id', sourceKey: 'batch_id', as: 'blockchainRecord', onDelete: 'CASCADE' });
BlockchainRecord.belongsTo(HoneyBatch, { foreignKey: 'batch_id', targetKey: 'batch_id', as: 'batch' });

HoneyBatch.hasOne(QRCode, { foreignKey: 'batch_id', sourceKey: 'batch_id', as: 'qrCode', onDelete: 'CASCADE' });
QRCode.belongsTo(HoneyBatch, { foreignKey: 'batch_id', targetKey: 'batch_id', as: 'batch' });

HoneyBatch.hasOne(MarketListing, { foreignKey: 'batch_id', sourceKey: 'batch_id', as: 'marketListing', onDelete: 'CASCADE' });
MarketListing.belongsTo(HoneyBatch, { foreignKey: 'batch_id', targetKey: 'batch_id', as: 'batch' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Beekeeper,
  Apiary,
  Hive,
  QueenHistory,
  BroodObservation,
  SensorReading,
  CameraObservation,
  BeeImage,
  HealthScore,
  RiskPrediction,
  HealthEvent,
  Recommendation,
  ActionSimulation,
  BeekeeperAction,
  RecoveryRecord,
  HoneyBatch,
  BatchEvent,
  BlockchainRecord,
  QRCode,
  MarketListing,
  AuditLog
};
