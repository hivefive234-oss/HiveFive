const { HoneyBatch, BatchEvent, BlockchainRecord, QRCode, Hive, Apiary, Beekeeper, User } = require('../models');
const { createCanonicalString, computeBatchHash } = require('../services/canonicalHash');
const blockchainService = require('../services/blockchainService');
const { generateBatchQRCode } = require('../services/qrService');
const { logAudit } = require('../middleware/audit');

exports.createBatch = async (req, res) => {
  try {
    const {
      hive_id,
      apiary_id,
      harvest_date,
      quantity_kg,
      honey_type,
      moisture_percentage,
      floral_source,
      processing_method
    } = req.body;

    const hive = await Hive.findByPk(hive_id, {
      include: [{ model: Apiary, as: 'apiary' }]
    });

    if (!hive) return res.status(404).json({ error: 'Hive not found.' });

    const batchCode = 'BATCH-' + Date.now().toString().slice(-6);
    const locationName = hive.apiary?.location_name || 'Western Ghats Bio-Reserve';

    // 1. Build canonical batch representation
    const canonicalString = createCanonicalString({
      batch_id: batchCode,
      hive_code: hive.hive_code,
      harvest_date: harvest_date || new Date().toISOString().split('T')[0],
      quantity_kg,
      location_name: locationName,
      floral_source: floral_source || honey_type,
      moisture_percentage: moisture_percentage || 17.5
    });

    // 2. Generate SHA-256 hash
    const canonicalHash = computeBatchHash(canonicalString);

    // 3. Register on Blockchain
    const blockchainRes = await blockchainService.registerBatch(batchCode, canonicalHash);

    // 4. Generate QR code
    const qrInfo = await generateBatchQRCode(batchCode);

    // 5. Store HoneyBatch in database
    const batch = await HoneyBatch.create({
      batch_id: batchCode,
      hive_id: hive.id,
      apiary_id: apiary_id || hive.apiary_id,
      beekeeper_id: req.user?.id || 1,
      harvest_date: harvest_date || new Date().toISOString().split('T')[0],
      quantity_kg: parseFloat(quantity_kg),
      honey_type: honey_type || 'Multifloral Raw Honey',
      moisture_percentage: parseFloat(moisture_percentage || 17.5),
      floral_source: floral_source || 'Wild Western Ghats Flora',
      processing_method: processing_method || 'Cold extracted, coarse filtered',
      packaging_date: new Date().toISOString().split('T')[0],
      status: 'VERIFIED',
      canonical_hash: canonicalHash,
      tx_hash: blockchainRes.txHash,
      qr_code_url: qrInfo.qrDataUrl
    });

    // 6. Record Batch Lifecycle Events
    await BatchEvent.create({
      batch_id: batchCode,
      event_type: 'HARVEST',
      location: locationName,
      timestamp: new Date(),
      notes: `Harvested ${quantity_kg} kg from hive ${hive.hive_code}.`,
      operator: req.user?.full_name || 'Certified Beekeeper'
    });

    await BatchEvent.create({
      batch_id: batchCode,
      event_type: 'BLOCKCHAIN_REGISTRATION',
      location: 'Ethereum Node (Hardhat/Sepolia)',
      timestamp: new Date(),
      notes: `Cryptographic integrity sealed. Tx: ${blockchainRes.txHash.slice(0, 16)}...`,
      operator: 'HoneyChain Smart Contract'
    });

    // 7. Store Blockchain record & QR code
    await BlockchainRecord.create({
      batch_id: batchCode,
      canonical_hash: canonicalHash,
      tx_hash: blockchainRes.txHash,
      block_number: blockchainRes.blockNumber || 101,
      contract_address: blockchainRes.contractAddress,
      chain_id: blockchainRes.chainId || 31337,
      status: 'CONFIRMED',
      timestamp: blockchainRes.timestamp || new Date()
    });

    await QRCode.create({
      batch_id: batchCode,
      qr_image_data: qrInfo.qrDataUrl,
      public_verification_url: qrInfo.verificationUrl,
      generated_at: new Date()
    });

    await logAudit(req.user?.id || 1, 'BATCH_CREATED_AND_MINITED', 'HoneyBatch', batchCode, { canonicalHash, txHash: blockchainRes.txHash });

    res.status(201).json({
      message: 'Honey batch created and cryptographically registered on blockchain',
      batch,
      canonicalString,
      canonicalHash,
      blockchain: blockchainRes,
      qrCode: qrInfo
    });
  } catch (error) {
    console.error('createBatch error:', error);
    res.status(500).json({ error: 'Failed to create honey batch.' });
  }
};

exports.getAllBatches = async (req, res) => {
  try {
    const batches = await HoneyBatch.findAll({
      include: [
        { model: Hive, as: 'hive', attributes: ['id', 'hive_code'] },
        { model: Apiary, as: 'apiary', attributes: ['id', 'name', 'location_name'] },
        { model: BlockchainRecord, as: 'blockchainRecord' },
        { model: BatchEvent, as: 'events' }
      ],
      order: [['harvest_date', 'DESC']]
    });
    res.json({ batches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch honey batches.' });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await HoneyBatch.findOne({
      where: { batch_id: batchId },
      include: [
        { model: Hive, as: 'hive' },
        { model: Apiary, as: 'apiary' },
        { model: BlockchainRecord, as: 'blockchainRecord' },
        { model: BatchEvent, as: 'events', order: [['timestamp', 'ASC']] },
        { model: QRCode, as: 'qrCode' }
      ]
    });
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });
    res.json({ batch });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch.' });
  }
};
