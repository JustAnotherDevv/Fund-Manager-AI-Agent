const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const originalJsonStringify = JSON.stringify;
JSON.stringify = function (obj, replacer, space) {
  return originalJsonStringify(
    obj,
    (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return replacer ? replacer(key, value) : value;
    },
    space
  );
};

const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

async function main() {
  console.log("Starting interaction script...");

  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);

  //   const registry = await loadContract(
  //     "AIFundRegistry",
  //     deploymentData.contracts.registry
  //   );
  const conservativeManager = await loadContract(
    "BaseAIManager",
    deploymentData.contracts.conservativeManager
  );
  //   const aggressiveManager = await loadContract(
  //     "BaseAIManager",
  //     deploymentData.contracts.aggressiveManager
  //   );
  const fund = await loadContract("AIFund", deploymentData.contracts.testFund);

  console.log("\nFund details:");
  const owner = await fund.owner();
  const manager = await fund.aiManager();
  console.log(`Owner: ${owner}`);
  console.log(`Manager: ${manager}`);

  const [tokens, balances] = await fund.getAllBalances();
  console.log("\nFund balances:");

  for (let i = 0; i < tokens.length; i++) {
    const tokenContract = await loadContract("MockERC20", tokens[i]);
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const humanBalance = ethers.formatUnits(balances[i], decimals);
    console.log(`${symbol}: ${humanBalance}`);
  }

  console.log("\nExecuting test strategy...");

  // Create a simple strategy
  //   todo - test with actual calldata
  const strategyData = JSON.stringify({
    action: "test",
    timestamp: Date.now(),
    message: "This is a test strategy execution",
  });

  const encodedData = ethers.toUtf8Bytes(strategyData);

  const tx = await conservativeManager.executeStrategy(
    fund.target,
    encodedData
  );
  await tx.wait();

  console.log(`Strategy executed: ${tx.hash}`);
  console.log("\nInteraction completed successfully!");
}

async function loadContract(name, address) {
  const contractFactory = await ethers.getContractFactory(name);
  return contractFactory.attach(address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
