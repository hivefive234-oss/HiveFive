const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, actionController.recordAction);
router.post('/recovery', protect, actionController.recordRecovery);
router.get('/', protect, actionController.getAllActionsAndRecovery);

module.exports = router;
