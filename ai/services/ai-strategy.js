// src/services/ai-strategy.js
const { Configuration, OpenAIApi } = require("openai");
const { logger } = require("../utils/logger");

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Strategy types
const STRATEGY_TYPES = {
  CONSERVATIVE: "conservative",
  MODERATE: "moderate",
  AGGRESSIVE: "aggressive",
};

class AIStrategyService {
  // Generate strategy based on fund data and market conditions
  async generateStrategy(fund, balances, marketPrices) {
    try {
      // Determine strategy type based on manager type
      const strategyType = this.determineStrategyType(fund.manager_type);

      // Prepare context for AI
      const context = this.prepareContext(
        fund,
        balances,
        marketPrices,
        strategyType
      );

      // Call OpenAI to generate strategy
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(strategyType),
          },
          {
            role: "user",
            content: context,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      // Extract strategy from response
      const strategyText = response.data.choices[0].message.content;

      // Parse strategy JSON
      try {
        const strategyJson = JSON.parse(strategyText);

        // Return structured strategy
        return {
          fundAddress: fund.address,
          data: {
            trades: strategyJson.trades || [],
            rebalances: strategyJson.rebalances || [],
          },
          reasoning: strategyJson.reasoning || "No reasoning provided",
          expectedReturn: strategyJson.expectedReturn || 0,
        };
      } catch (parseError) {
        logger.error("Error parsing AI response:", parseError);
        throw new Error("Failed to parse AI strategy response");
      }
    } catch (error) {
      logger.error("Error generating AI strategy:", error);
      throw error;
    }
  }

  // Determine strategy type based on manager type
  determineStrategyType(managerType) {
    if (managerType.toLowerCase().includes("conservative")) {
      return STRATEGY_TYPES.CONSERVATIVE;
    } else if (managerType.toLowerCase().includes("aggressive")) {
      return STRATEGY_TYPES.AGGRESSIVE;
    } else {
      return STRATEGY_TYPES.MODERATE;
    }
  }

  // Prepare context for AI
  prepareContext(fund, balances, marketPrices, strategyType) {
    // Format balances with token info
    const formattedBalances = balances.map((balance) => ({
      token: balance.token_address,
      symbol: balance.symbol || "Unknown",
      balance: balance.human_balance,
      valueUsd: balance.price ? balance.human_balance * balance.price : null,
    }));

    // Calculate total portfolio value
    const totalValue = formattedBalances.reduce((sum, balance) => {
      return sum + (balance.valueUsd || 0);
    }, 0);

    // Calculate allocation percentages
    const allocations = formattedBalances.map((balance) => ({
      ...balance,
      allocation:
        totalValue > 0 ? ((balance.valueUsd || 0) / totalValue) * 100 : 0,
    }));

    // Create context object
    return JSON.stringify({
      fund: {
        address: fund.address,
        managerType: fund.manager_type,
      },
      portfolio: {
        totalValueUsd: totalValue,
        assets: allocations,
      },
      marketData: {
        prices: marketPrices,
        timestamp: new Date().toISOString(),
      },
      strategyType,
      timestamp: new Date().toISOString(),
    });
  }

  // Get system prompt based on strategy type
  getSystemPrompt(strategyType) {
    const basePrompt = `
      You are an advanced AI fund manager specialized in crypto asset management.
      Analyze the provided portfolio and market data to generate an optimal trading strategy.
      
      Respond with a JSON object containing:
      - trades: Array of objects with {tokenSell, tokenBuy, amountSell, expectedAmountBuy}
      - rebalances: Array of objects with {tokenSell, tokenBuy, amountSell, expectedAmountBuy}
      - reasoning: String explaining your decision process
      - expectedReturn: Number representing estimated 30-day percentage return
    `;

    switch (strategyType) {
      case STRATEGY_TYPES.CONSERVATIVE:
        return `${basePrompt}
          As a conservative manager, prioritize capital preservation.
          - Focus on stablecoins and blue-chip assets
          - Maintain significant stablecoin reserves (at least 40%)
          - Avoid assets with high volatility
          - Target modest, consistent returns (5-8% annual)
          - Keep the number of trades minimal to reduce fees
        `;

      case STRATEGY_TYPES.MODERATE:
        return `${basePrompt}
          As a moderate manager, balance growth and safety.
          - Maintain diversified exposure across asset classes
          - Keep 20-30% in stablecoins as a reserve
          - Seek opportunities in medium-volatility assets
          - Target medium returns (10-15% annual)
          - Rebalance when allocations drift beyond thresholds
        `;

      case STRATEGY_TYPES.AGGRESSIVE:
        return `${basePrompt}
          As an aggressive manager, prioritize high growth potential.
          - Focus on high-momentum assets
          - Maintain minimal stablecoin reserves (5-15%)
          - Take calculated risks on high-volatility assets
          - Target high returns (20%+ annual)
          - Actively rotate capital to capture market movements
        `;

      default:
        return basePrompt;
    }
  }
}

module.exports = new AIStrategyService();
