const crypto = require('crypto');

/**
 * Creates canonical string representation for Honey Batch verification
 * Format: BatchID|HiveID|HarvestDate|Quantity|Location|Flora|Moisture
 */
function createCanonicalString(batch) {
  const parts = [
    String(batch.batch_id || '').trim(),
    String(batch.hive_code || batch.hive_id || '').trim(),
    String(batch.harvest_date || '').trim(),
    parseFloat(batch.quantity_kg || 0).toFixed(2),
    String(batch.location_name || batch.location || '').trim(),
    String(batch.floral_source || batch.honey_type || '').trim(),
    parseFloat(batch.moisture_percentage || 0).toFixed(1)
  ];
  return parts.join('|');
}

/**
 * Computes SHA-256 hash from canonical batch string
 */
function computeBatchHash(canonicalString) {
  return '0x' + crypto.createHash('sha256').update(canonicalString).digest('hex');
}

module.exports = {
  createCanonicalString,
  computeBatchHash
};
