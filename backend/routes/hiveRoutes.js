const express = require('express');
const router = express.Router();
const hiveController = require('../controllers/hiveController');
const { protect } = require('../middleware/auth');

router.get('/', protect, hiveController.getAllHives);
router.get('/apiaries', protect, hiveController.getApiaries);
router.get('/apiary/:apiaryId/correlation', protect, hiveController.getApiaryCorrelation);
router.get('/:id', protect, hiveController.getHiveById);
router.get('/:id/passport', protect, hiveController.getHivePassport);

module.exports = router;
