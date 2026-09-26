// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneyChainRegistry
 * @notice Immutable blockchain ledger for Honey Batch canonical integrity verification.
 * Only cryptographic digests, batch IDs, timestamps, and status are stored on-chain.
 */
contract HoneyChainRegistry {
    address public owner;

    enum BatchStatus {
        HARVESTED,
        PROCESSING,
        PACKAGED,
        VERIFIED,
        RECALLED
    }

    struct BatchRecord {
        string batchId;
        bytes32 canonicalHash;
        uint256 timestamp;
        address registeredBy;
        BatchStatus status;
        bool exists;
    }

    // Mapping: batchId => BatchRecord
    mapping(string => BatchRecord) private batches;

    // Events
    event BatchRegistered(
        string indexed batchId,
        bytes32 indexed canonicalHash,
        uint256 timestamp,
        address registeredBy
    );

    event BatchStatusUpdated(
        string indexed batchId,
        BatchStatus oldStatus,
        BatchStatus newStatus,
        uint256 updateTimestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "HoneyChainRegistry: Caller is not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Registers a new honey harvest batch with its canonical SHA-256 digest
     * @param batchId Unique identifier for the batch (e.g. BATCH-2026-001)
     * @param canonicalHash SHA-256 hash formatted as bytes32
     */
    function registerBatch(string memory batchId, bytes32 canonicalHash) external returns (bool) {
        require(bytes(batchId).length > 0, "HoneyChainRegistry: Batch ID cannot be empty");
        require(canonicalHash != bytes32(0), "HoneyChainRegistry: Canonical hash cannot be zero");
        require(!batches[batchId].exists, "HoneyChainRegistry: Batch ID is already registered");

        batches[batchId] = BatchRecord({
            batchId: batchId,
            canonicalHash: canonicalHash,
            timestamp: block.timestamp,
            registeredBy: msg.sender,
            status: BatchStatus.VERIFIED,
            exists: true
        });

        emit BatchRegistered(batchId, canonicalHash, block.timestamp, msg.sender);
        return true;
    }

    /**
     * @notice Verifies whether a provided canonical hash matches the immutable on-chain record
     */
    function verifyBatch(string memory batchId, bytes32 canonicalHash)
        external
        view
        returns (
            bool isValid,
            uint256 registeredTimestamp,
            address registeredBy,
            uint8 status
        )
    {
        BatchRecord memory record = batches[batchId];
        if (!record.exists) {
            return (false, 0, address(0), 0);
        }

        isValid = (record.canonicalHash == canonicalHash);
        return (isValid, record.timestamp, record.registeredBy, uint8(record.status));
    }

    /**
     * @notice Retrieves full public metadata for a verified batch
     */
    function getBatchRecord(string memory batchId)
        external
        view
        returns (
            string memory id,
            bytes32 hash,
            uint256 timestamp,
            address registeredBy,
            uint8 status
        )
    {
        BatchRecord memory record = batches[batchId];
        require(record.exists, "HoneyChainRegistry: Batch record does not exist");
        return (
            record.batchId,
            record.canonicalHash,
            record.timestamp,
            record.registeredBy,
            uint8(record.status)
        );
    }

    /**
     * @notice Allows updating lifecycle or recall status
     */
    function updateBatchStatus(string memory batchId, uint8 newStatus) external returns (bool) {
        BatchRecord storage record = batches[batchId];
        require(record.exists, "HoneyChainRegistry: Batch record does not exist");
        require(msg.sender == record.registeredBy || msg.sender == owner, "HoneyChainRegistry: Unauthorized status update");

        BatchStatus old = record.status;
        record.status = BatchStatus(newStatus);

        emit BatchStatusUpdated(batchId, old, record.status, block.timestamp);
        return true;
    }
}
