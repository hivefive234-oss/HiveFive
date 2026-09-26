const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('admin', 'kvic'));

router.get('/metrics', adminController.getAdminMetrics);
router.get('/beekeepers', adminController.getBeekeepers);
router.patch('/beekeepers/:id/status', adminController.updateBeekeeperStatus);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
