const { AuditLog } = require('../models');

async function logAudit(userId, action, entityType, entityId, details, ipAddress = null) {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: String(entityId || ''),
      details_json: typeof details === 'object' ? JSON.stringify(details) : details,
      ip_address: ipAddress || '127.0.0.1',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
}

module.exports = { logAudit };
