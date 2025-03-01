const { startAgentService } = require("./services/agent.js");
const { setupDatabase } = require("./db/setup.js");
const { logger } = require("./utils/logger.js");

async function main() {
  try {
    await setupDatabase();

    await startAgentService();

    logger.info("AI Fund Manager successfully started");
  } catch (error) {
    logger.error("Failed to start AI Fund Manager:", error);
    process.exit(1);
  }
}

main();
