// src/services/agent.js
const { scheduleJob } = require("node-schedule");
const blockchainService = require("./blockchain");
const aiStrategyService = require("./ai-strategy");
const { fundRepository, strategyRepository } = require("../db/repositories");
const { logger } = require("../utils/logger");
const { sleep } = require("../utils/helpers");

class AgentService {
  constructor() {
    this.checkInterval = process.env.CHECK_INTERVAL_MINUTES || 60; // Minutes
    this.executeInterval = process.env.EXECUTE_INTERVAL_HOURS || 24; // Hours
    this.isRunning = false;
  }

  // Start the agent service
  async start() {
    try {
      logger.info("Starting AI Fund Manager agent service");

      // Schedule periodic checks for new funds
      scheduleJob(`*/${this.checkInterval} * * * *`, () => {
        this.checkForNewFunds();
      });

      // Schedule periodic strategy executions
      scheduleJob(`0 */${this.executeInterval} * * *`, () => {
        this.executeStrategies();
      });

      // Run initial check
      await this.checkForNewFunds();

      logger.info("AI Fund Manager agent service started successfully");
    } catch (error) {
      logger.error("Error starting agent service:", error);
      throw error;
    }
  }

  // Check for new funds assigned to this manager
  async checkForNewFunds() {
    if (this.isRunning) {
      logger.info("Previous check still running, skipping");
      return;
    }

    try {
      this.isRunning = true;
      logger.info("Checking for new funds...");

      // Query blockchain for new funds
      const newFunds = await blockchainService.checkForNewFunds();

      if (newFunds.length > 0) {
        logger.info(`Found ${newFunds.length} new funds`);

        // Update balances for each fund
        for (const fundAddress of newFunds) {
          await blockchainService.updateFundBalances(fundAddress);
        }
      } else {
        logger.info("No new funds found");
      }

      // Update existing funds as well
      const existingFunds = await fundRepository.findAll();
      logger.info(`Updating ${existingFunds.length} existing funds`);

      for (const fund of existingFunds) {
        await blockchainService.updateFundBalances(fund.address);

        // Avoid rate limiting
        await sleep(1000);
      }

      logger.info("Fund check completed successfully");
    } catch (error) {
      logger.error("Error checking for new funds:", error);
    } finally {
      this.isRunning = false;
    }
  }

  // Execute strategies for all managed funds
  async executeStrategies() {
    if (this.isRunning) {
      logger.info("Previous execution still running, skipping");
      return;
    }

    try {
      this.isRunning = true;
      logger.info("Executing strategies for managed funds...");

      // Get all funds
      const funds = await fundRepository.findAll();
      logger.info(`Found ${funds.length} funds to process`);

      for (const fund of funds) {
        try {
          // Get fund balances
          const balances = await fundRepository.getBalances(fund.address);

          // Get market prices (simplified - in a real implementation, you'd fetch from an API)
          const marketPrices = this.getMarketPrices(balances);

          // Generate strategy
          const strategy = await aiStrategyService.generateStrategy(
            fund,
            balances,
            marketPrices
          );

          // Save strategy to database
          const savedStrategy = await strategyRepository.save(strategy);

          // Check if strategy should be executed
          if (this.shouldExecuteStrategy(strategy)) {
            logger.info(`Executing strategy for fund ${fund.address}`);

            // Execute strategy
            const txHash = await blockchainService.executeStrategy(
              fund.address,
              fund.manager_address,
              strategy.data
            );

            // Update strategy status
            await strategyRepository.updateStatus(
              savedStrategy.id,
              "executed",
              txHash,
              Math.floor(Date.now() / 1000)
            );

            logger.info(
              `Strategy executed for fund ${fund.address}, tx: ${txHash}`
            );
          } else {
            logger.info(
              `Skipping execution for fund ${fund.address}, not enough changes to justify transaction costs`
            );

            // Mark as skipped
            await strategyRepository.updateStatus(savedStrategy.id, "skipped");
          }

          // Avoid rate limiting
          await sleep(2000);
        } catch (error) {
          logger.error(`Error processing fund ${fund.address}:`, error);
        }
      }

      logger.info("Strategy execution cycle completed");
    } catch (error) {
      logger.error("Error executing strategies:", error);
    } finally {
      this.isRunning = false;
    }
  }

  // Determine if a strategy should be executed
  shouldExecuteStrategy(strategy) {
    // Skip if no trades or rebalances
    if (!strategy.data.trades.length && !strategy.data.rebalances.length) {
      return false;
    }

    // Check expected return against minimum threshold
    const MIN_EXPECTED_RETURN = 0.5; // 0.5% minimum expected return to justify gas costs
    return strategy.expectedReturn >= MIN_EXPECTED_RETURN;
  }

  // Simple market price getter (in real implementation, would call an API)
  getMarketPrices(balances) {
    // Mock prices for demonstration - in production, fetch from an API
    const mockPrices = {
      // Stablecoins
      "0xdac17f958d2ee523a2206206994597c13d831ec7": 1.0, // USDT
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 1.0, // USDC
      "0x6b175474e89094c44da98b954eedeac495271d0f": 1.0, // DAI

      // Major assets
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 3000.0, // WETH
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 60000.0, // WBTC

      // Other assets
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 5.5, // UNI
      "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": 90.0, // AAVE
    };

    // Return prices for our tokens
    return balances.reduce((prices, balance) => {
      prices[balance.token_address] =
        mockPrices[balance.token_address.toLowerCase()] || 0;
      return prices;
    }, {});
  }
}

// Export functions
const agentService = new AgentService();
const startAgentService = () => agentService.start();

module.exports = {
  startAgentService,
};
