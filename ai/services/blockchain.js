// src/services/blockchain.js
const {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatUnits,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { mainnet } = require("viem/chains");
const { logger } = require("../utils/logger");
const { fundRepository, tokenRepository } = require("../db/repositories");
require("dotenv").config();

// Contract ABIs
const REGISTRY_ABI = [
  "function getUserFunds(address user) external view returns (address[])",
  "function aiManagers(address) external view returns (string, string, string, address, address[], bool, uint256)",
];

const FUND_ABI = [
  "function owner() external view returns (address)",
  "function aiManager() external view returns (address)",
  "function deposit(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount) external",
  "function executeStrategy(bytes calldata strategyData) external",
  "function getBalance(address token) external view returns (uint256)",
  "function getAllBalances() external view returns (address[], uint256[])",
  "function getTransactionHistory() external view returns (tuple(address token, uint256 amount, bool isDeposit, uint256 timestamp)[])",
];

const AI_MANAGER_ABI = [
  "function executeStrategy(address fund, bytes strategyData) external",
  "function getPerformanceMetrics(address fund) external view returns (bytes)",
  "function getSupportedTokens() external view returns (address[])",
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

class BlockchainService {
  constructor() {
    // Read from environment variables or config
    this.rpcUrl =
      process.env.RPC_URL ||
      "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
    this.privateKey = process.env.PRIVATE_KEY;
    this.registryAddress = process.env.REGISTRY_ADDRESS;

    // Initialize clients
    this.initializeClients();
  }

  initializeClients() {
    // Initialize public client for reading from blockchain
    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http(this.rpcUrl),
    });

    // Initialize wallet client for writing to blockchain
    if (this.privateKey) {
      this.account = privateKeyToAccount(this.privateKey);
      this.walletClient = createWalletClient({
        chain: mainnet,
        transport: http(this.rpcUrl),
        account: this.account,
      });
    }
  }

  // Check for new funds created for this AI manager
  async checkForNewFunds() {
    try {
      // Get our manager addresses
      console.log(process.env.MANAGER_ADDRESSES);
      const managerAddresses = process.env.MANAGER_ADDRESSES.split(",");

      // Get all funds from registry
      const allFunds = await this.getAllFundsFromRegistry();

      // Filter funds that use our managers
      const ourFunds = [];

      for (const fundAddress of allFunds) {
        try {
          const managerAddress = await this.publicClient.readContract({
            address: fundAddress,
            abi: parseAbi(FUND_ABI),
            functionName: "aiManager",
          });

          if (managerAddresses.includes(managerAddress.toLowerCase())) {
            // Get fund details
            const fundDetails = await this.getFundDetails(fundAddress);

            // Save to database
            await fundRepository.save({
              address: fundAddress,
              owner: fundDetails.owner,
              managerAddress: fundDetails.manager,
              managerType: fundDetails.managerType,
              createdAt: Math.floor(Date.now() / 1000),
            });

            // Save balances
            await this.updateFundBalances(fundAddress);

            ourFunds.push(fundAddress);
          }
        } catch (error) {
          logger.error(`Error processing fund ${fundAddress}:`, error);
        }
      }

      return ourFunds;
    } catch (error) {
      logger.error("Error checking for new funds:", error);
      throw error;
    }
  }

  // Get all funds from registry
  async getAllFundsFromRegistry() {
    try {
      // Get all user addresses that have created funds
      // This is simplified - a real implementation would need pagination and more
      const userAddresses = ["0x123", "0x456"]; // Example addresses

      const allFunds = [];

      for (const userAddress of userAddresses) {
        const funds = await this.publicClient.readContract({
          address: this.registryAddress,
          abi: parseAbi(REGISTRY_ABI),
          functionName: "getUserFunds",
          args: [userAddress],
        });

        allFunds.push(...funds);
      }

      return allFunds;
    } catch (error) {
      logger.error("Error getting funds from registry:", error);
      throw error;
    }
  }

  // Get fund details
  async getFundDetails(fundAddress) {
    try {
      // Get owner
      const owner = await this.publicClient.readContract({
        address: fundAddress,
        abi: parseAbi(FUND_ABI),
        functionName: "owner",
      });

      // Get manager
      const manager = await this.publicClient.readContract({
        address: fundAddress,
        abi: parseAbi(FUND_ABI),
        functionName: "aiManager",
      });

      // Get manager type from registry
      const managerData = await this.publicClient.readContract({
        address: this.registryAddress,
        abi: parseAbi(REGISTRY_ABI),
        functionName: "aiManagers",
        args: [manager],
      });

      const managerType = managerData[0]; // Name of the manager

      return {
        address: fundAddress,
        owner,
        manager,
        managerType,
      };
    } catch (error) {
      logger.error(`Error getting fund details for ${fundAddress}:`, error);
      throw error;
    }
  }

  // Update fund balances
  async updateFundBalances(fundAddress) {
    try {
      // Get all balances
      const [tokenAddresses, balances] = await this.publicClient.readContract({
        address: fundAddress,
        abi: parseAbi(FUND_ABI),
        functionName: "getAllBalances",
      });

      // Clear existing balances
      await fundRepository.deleteBalances(fundAddress);

      // Process each token
      for (let i = 0; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const balance = balances[i];

        // Get token info if not already in database
        let token = await tokenRepository.findByAddress(tokenAddress);

        if (!token) {
          // Get token info from blockchain
          const decimals = await this.publicClient.readContract({
            address: tokenAddress,
            abi: parseAbi(ERC20_ABI),
            functionName: "decimals",
          });

          const symbol = await this.publicClient.readContract({
            address: tokenAddress,
            abi: parseAbi(ERC20_ABI),
            functionName: "symbol",
          });

          // Save token info to database
          token = await tokenRepository.save({
            address: tokenAddress,
            symbol,
            decimals,
          });
        }

        // Convert balance to human-readable form
        const humanBalance = parseFloat(formatUnits(balance, token.decimals));

        // Save balance to database
        await fundRepository.saveBalance(
          fundAddress,
          tokenAddress,
          balance.toString(),
          humanBalance
        );
      }

      logger.info(`Updated balances for fund ${fundAddress}`);
    } catch (error) {
      logger.error(`Error updating balances for fund ${fundAddress}:`, error);
      throw error;
    }
  }

  // Execute strategy on fund
  async executeStrategy(fundAddress, managerAddress, strategyData) {
    try {
      if (!this.walletClient) {
        throw new Error("Wallet client not initialized. Private key missing.");
      }

      // Encode strategy data from object to bytes
      const encodedData = this.encodeStrategyData(strategyData);

      // Call manager's executeStrategy function
      const { request } = await this.publicClient.simulateContract({
        address: managerAddress,
        abi: parseAbi(AI_MANAGER_ABI),
        functionName: "executeStrategy",
        args: [fundAddress, encodedData],
        account: this.account.address,
      });

      const hash = await this.walletClient.writeContract(request);

      logger.info(`Executed strategy for fund ${fundAddress}, tx: ${hash}`);

      return hash;
    } catch (error) {
      logger.error(`Error executing strategy for fund ${fundAddress}:`, error);
      throw error;
    }
  }

  // Encode strategy data to bytes
  encodeStrategyData(strategyData) {
    // Simple implementation - just stringify and convert to hex
    // In a real implementation, you'd use a more efficient encoding
    return `0x${Buffer.from(JSON.stringify(strategyData)).toString("hex")}`;
  }
}

module.exports = new BlockchainService();
