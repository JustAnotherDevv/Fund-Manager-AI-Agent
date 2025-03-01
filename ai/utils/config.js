require("dotenv").config();

const config = {
  // App settings
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Blockchain settings
  rpcUrl:
    process.env.RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
  privateKey: process.env.PRIVATE_KEY,
  registryAddress: process.env.REGISTRY_ADDRESS,
  managerAddresses: process.env.MANAGER_ADDRESSES
    ? process.env.MANAGER_ADDRESSES.split(",")
    : [],

  // AI settings
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Agent settings
  checkIntervalMinutes: parseInt(
    process.env.CHECK_INTERVAL_MINUTES || "60",
    10
  ),
  executeIntervalHours: parseInt(
    process.env.EXECUTE_INTERVAL_HOURS || "24",
    10
  ),

  // Database settings
  dbPath: process.env.DB_PATH || "data/fund_manager.db",

  // Validation
  validate() {
    const requiredVars = [
      "RPC_URL",
      "PRIVATE_KEY",
      "REGISTRY_ADDRESS",
      "MANAGER_ADDRESSES",
      "OPENAI_API_KEY",
    ];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  },
};

module.exports = config;
