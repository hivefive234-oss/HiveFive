const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { protect } = require('../middleware/auth');

router.post('/', protect, batchController.createBatch);
router.get('/', protect, batchController.getAllBatches);
router.get('/:batchId', protect, batchController.getBatchById);

module.exports = router;
