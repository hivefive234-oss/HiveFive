const hre = require("hardhat");

async function main() {
  console.log("[HoneyChain Deployer] Deploying HoneyChainRegistry smart contract...");
  const Registry = await hre.ethers.getContractFactory("HoneyChainRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`[HoneyChain Deployer] HoneyChainRegistry successfully deployed to: ${contractAddress}`);

  // Register initial seed batch proof
  const seedBatchId = "BATCH-2026-001";
  const seedHash = "0x49683cc4650e8d99fb6aed940ccf9e202d01d60d6adc25dbbc972436b826ec3e";
  const tx = await registry.registerBatch(seedBatchId, seedHash);
  await tx.wait();
  console.log(`[HoneyChain Deployer] Registered seed batch ${seedBatchId} with hash ${seedHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
