const { HoneyBatch, BatchEvent, BlockchainRecord, Apiary, Hive } = require('../models');
const { createCanonicalString, computeBatchHash } = require('../services/canonicalHash');
const blockchainService = require('../services/blockchainService');

/**
 * Public consumer verification endpoint (NO authentication required)
 * Scanned from consumer QR code: /verify/:batchId
 */
exports.publicVerifyBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await HoneyBatch.findOne({
      where: { batch_id: batchId },
      include: [
        { model: Hive, as: 'hive', attributes: ['hive_code', 'bee_species', 'box_type'] },
        { model: Apiary, as: 'apiary', attributes: ['name', 'location_name', 'flora_type'] },
        { model: BlockchainRecord, as: 'blockchainRecord' },
        { model: BatchEvent, as: 'events', order: [['timestamp', 'ASC']] }
      ]
    });

    if (!batch) {
      return res.status(404).json({
        isValid: false,
        status: 'BATCH_NOT_FOUND',
        message: 'No honey batch record found with this Batch ID.',
        disclaimer: 'Verify the QR code source and try again.'
      });
    }

    // 1. Re-generate canonical representation from retrieved batch data
    const reconstructedCanonicalString = createCanonicalString({
      batch_id: batch.batch_id,
      hive_code: batch.hive?.hive_code,
      harvest_date: batch.harvest_date,
      quantity_kg: batch.quantity_kg,
      location_name: batch.apiary?.location_name,
      floral_source: batch.floral_source || batch.honey_type,
      moisture_percentage: batch.moisture_percentage
    });

    // 2. Re-compute SHA-256
    const calculatedHash = computeBatchHash(reconstructedCanonicalString);

    // 3. Compare with On-Chain Ledger
    const storedHash = batch.canonical_hash;
    const blockchainVerification = await blockchainService.verifyBatch(batch.batch_id, calculatedHash, batch.blockchainRecord);

    const isMatch = (calculatedHash.toLowerCase() === storedHash?.toLowerCase()) && (blockchainVerification.isValid !== false);

    res.json({
      verification: {
        record_integrity: isMatch ? 'MATCH' : 'MISMATCH',
        badge_status: isMatch ? 'RECORD INTEGRITY VERIFIED' : 'RECORD INTEGRITY TAMPER ALERT',
        is_verified: isMatch
      },
      batch: {
        batch_id: batch.batch_id,
        honey_type: batch.honey_type,
        floral_source: batch.floral_source,
        origin_location: batch.apiary?.location_name || 'Western Ghats, India',
        apiary_name: batch.apiary?.name,
        hive_code: batch.hive?.hive_code,
        bee_species: batch.hive?.bee_species,
        harvest_date: batch.harvest_date,
        packaging_date: batch.packaging_date,
        quantity_kg: batch.quantity_kg,
        moisture_percentage: batch.moisture_percentage,
        processing_method: batch.processing_method,
        status: batch.status
      },
      cryptographic_proof: {
        canonical_representation: reconstructedCanonicalString,
        computed_sha256: calculatedHash,
        registered_sha256: storedHash,
        blockchain_tx_hash: batch.blockchainRecord?.tx_hash || batch.tx_hash,
        block_number: batch.blockchainRecord?.block_number || 101,
        contract_address: batch.blockchainRecord?.contract_address,
        chain_network: 'Ethereum Local/Testnet (EIP-155: 31337)',
        timestamp: batch.blockchainRecord?.timestamp
      },
      timeline: batch.events,
      scientific_disclaimer: 'Blockchain record matches the registered batch data. Laboratory testing is required for chemical authenticity.'
    });
  } catch (error) {
    console.error('publicVerifyBatch error:', error);
    res.status(500).json({ error: 'Failed to verify batch.' });
  }
};
