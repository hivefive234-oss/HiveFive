const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { protect } = require('../middleware/auth');

// Public or API-key protected ESP32 ingestion
router.post('/iot', sensorController.ingestSensorData);
router.get('/hive/:hiveId', protect, sensorController.getReadingsByHive);

module.exports = router;
