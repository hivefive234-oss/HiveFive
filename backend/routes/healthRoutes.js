const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

router.get('/hive/:hiveId/analyze', protect, healthController.analyzeHealth);
router.get('/hive/:hiveId/explain', protect, healthController.getExplainability);
router.get('/hive/:hiveId/simulate-action', protect, healthController.getActionSimulation);
router.get('/hive/:hiveId/production-impact', protect, healthController.getProductionImpact);

router.get('/model-info', healthController.getModelInfo);

module.exports = router;
