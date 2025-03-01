const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// todo - test for edge cases
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

async function main() {
  console.log("Starting deployment...");

  // signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // mock tokens for dev version testing
  console.log("\nDeploying mock tokens...");
  const mockUSDC = await deployContract("MockUSDC", [deployer.address]);
  const mockUSDT = await deployContract("MockUSDT", [deployer.address]);
  const mockDAI = await deployContract("MockDAI", [deployer.address]);
  const mockWETH = await deployContract("MockWETH", [deployer.address]);
  const mockWBTC = await deployContract("MockWBTC", [deployer.address]);

  await mintTokens(mockUSDC, deployer, "1000000000000"); // 1M USDC
  await mintTokens(mockUSDT, deployer, "1000000000000"); // 1M USDT
  await mintTokens(mockDAI, deployer, ethers.parseEther("1000000")); // 1M DAI
  await mintTokens(mockWETH, deployer, ethers.parseEther("1000")); // 1000 WETH
  await mintTokens(mockWBTC, deployer, "10000000000"); // 100 WBTC

  console.log("\nDeploying AIFundRegistry...");
  const registry = await deployContract("AIFundRegistry", []);

  const supportedTokens = [
    mockUSDC.target,
    mockUSDT.target,
    mockDAI.target,
    mockWETH.target,
    mockWBTC.target,
  ];

  console.log("\nDeploying AI Managers...");
  const conservativeManager = await deployContract("BaseAIManager", [
    registry.target,
    "Conservative AI Manager",
    "Low-risk strategy focused on capital preservation",
    "Primarily invests in stablecoins and blue-chip tokens with minimal volatility",
    supportedTokens,
  ]);
  const aggressiveManager = await deployContract("BaseAIManager", [
    registry.target,
    "Aggressive AI Manager",
    "High-risk high-reward strategy seeking maximum returns",
    "Utilizes leverage and invests in volatile assets to maximize potential returns",
    supportedTokens,
  ]);

  console.log("\nRegistering managers with registry...");
  await registry.registerAIManager(
    "Conservative AI Manager",
    "Low-risk strategy focused on capital preservation",
    "Primarily invests in stablecoins and blue-chip tokens with minimal volatility",
    conservativeManager.target,
    supportedTokens
  );

  await registry.registerAIManager(
    "Aggressive AI Manager",
    "High-risk high-reward strategy seeking maximum returns",
    "Utilizes leverage and invests in volatile assets to maximize potential returns",
    aggressiveManager.target,
    supportedTokens
  );

  console.log("\nCreating test fund...");
  const tx = await registry.createFund(conservativeManager.target);
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Transaction mined in block: ${receipt.blockNumber}`);

  let fundAddress = null;

  console.log("Looking for fund address in event logs...");
  console.log(`Found ${receipt.logs.length} event logs`);

  for (const log of receipt.logs) {
    try {
      const eventInterface = new ethers.Interface([
        "event FundCreated(address indexed owner, address indexed fundAddress, address indexed managerImplementation)",
      ]);

      const decodedLog = eventInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (decodedLog && decodedLog.name === "FundCreated") {
        fundAddress = decodedLog.args.fundAddress;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!fundAddress) {
    console.log("Fallback: getting fund from getUserFunds...");
    const funds = await registry.getUserFunds(deployer.address);
    if (funds.length > 0) {
      fundAddress = funds[funds.length - 1]; // Get the last fund created
    } else {
      throw new Error("No funds found for deployer");
    }
  }

  console.log(`Test fund created at: ${fundAddress}`);

  const fundFactory = await ethers.getContractFactory("AIFund");
  const fund = fundFactory.attach(fundAddress);

  console.log("\nDepositing tokens to test fund...");
  await approveAndDeposit(mockUSDC, fund, deployer, "10000000000"); // 10k USDC
  await approveAndDeposit(mockWETH, fund, deployer, ethers.parseEther("10")); // 10 WETH

  // deployment info being saved in dev file
  const deploymentInfo = {
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    tokens: {
      USDC: mockUSDC.target,
      USDT: mockUSDT.target,
      DAI: mockDAI.target,
      WETH: mockWETH.target,
      WBTC: mockWBTC.target,
    },
    contracts: {
      registry: registry.target,
      conservativeManager: conservativeManager.target,
      aggressiveManager: aggressiveManager.target,
      testFund: fundAddress,
    },
  };

  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentDir, "localhost.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment information saved to deployments/localhost.json");
  console.log("\nDeployment completed successfully!");
}

async function deployContract(name, args = []) {
  const contractFactory = await ethers.getContractFactory(name);
  const contract = await contractFactory.deploy(...args);
  await contract.waitForDeployment();

  console.log(`${name} deployed to: ${contract.target}`);
  return contract;
}

async function mintTokens(token, deployer, amount) {
  const symbol = await token.symbol();
  await token.mint(deployer.address, amount);
  console.log(`Minted ${amount} ${symbol} to ${deployer.address}`);
}

async function approveAndDeposit(token, fund, signer, amount) {
  const symbol = await token.symbol();
  await token.approve(fund.target, amount);
  await fund.deposit(token.target, amount);
  console.log(`Deposited ${amount} ${symbol} to fund ${fund.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
