const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');

router.get('/scenarios', simulatorController.getScenarios);
router.post('/tick', simulatorController.triggerSimulatedTick);

module.exports = router;
