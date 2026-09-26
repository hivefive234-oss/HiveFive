const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChainRegistry Smart Contract", function () {
  let registry;
  let owner;
  let beekeeper;
  let other;

  const validBatchId = "BATCH-2026-001";
  const validHash = "0x49683cc4650e8d99fb6aed940ccf9e202d01d60d6adc25dbbc972436b826ec3e";
  const tamperedHash = "0x1111111111111111111111111111111111111111111111111111111111111111";

  beforeEach(async function () {
    [owner, beekeeper, other] = await ethers.getSigners();
    const RegistryFactory = await ethers.getContractFactory("HoneyChainRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  it("Should register a new honey batch successfully", async function () {
    const tx = await registry.connect(beekeeper).registerBatch(validBatchId, validHash);
    await expect(tx)
      .to.emit(registry, "BatchRegistered")
      .withArgs(validBatchId, validHash, await ethers.provider.getBlock("latest").then(b => b.timestamp), beekeeper.address);

    const record = await registry.getBatchRecord(validBatchId);
    expect(record.id).to.equal(validBatchId);
    expect(record.hash).to.equal(validHash);
    expect(record.registeredBy).to.equal(beekeeper.address);
    expect(record.status).to.equal(3); // VERIFIED
  });

  it("Should verify canonical hash matches and detect tampered hashes", async function () {
    await registry.connect(beekeeper).registerBatch(validBatchId, validHash);

    // Matching hash verification
    const [isValidMatch] = await registry.verifyBatch(validBatchId, validHash);
    expect(isValidMatch).to.be.true;

    // Tampered hash verification
    const [isValidTampered] = await registry.verifyBatch(validBatchId, tamperedHash);
    expect(isValidTampered).to.be.false;
  });

  it("Should prevent duplicate batch registration", async function () {
    await registry.connect(beekeeper).registerBatch(validBatchId, validHash);
    await expect(
      registry.connect(beekeeper).registerBatch(validBatchId, validHash)
    ).to.be.revertedWith("HoneyChainRegistry: Batch ID is already registered");
  });
});
