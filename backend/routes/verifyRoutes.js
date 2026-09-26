const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

// Public route - NO authentication required for consumer QR verification
router.get('/:batchId', verifyController.publicVerifyBatch);

module.exports = router;
