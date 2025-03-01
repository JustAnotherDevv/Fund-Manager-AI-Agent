// src/db/setup.js
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const { logger } = require("../utils/logger");

let db = null;

async function setupDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, "../data");
    if (!require("fs").existsSync(dataDir)) {
      require("fs").mkdirSync(dataDir, { recursive: true });
      logger.info(`Created data directory: ${dataDir}`);
    }

    const dbPath = path.join(dataDir, "fund_manager.db");
    logger.info(`Using database at: ${dbPath}`);

    // Connect to database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    logger.info("Connected to SQLite database");

    // Create tables if they don't exist
    await createTables();

    return db;
  } catch (error) {
    logger.error("Database setup failed:", error);
    throw error;
  }
}

async function createTables() {
  // Funds table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS funds (
      address TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      manager_address TEXT NOT NULL,
      manager_type TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_updated INTEGER NOT NULL
    )
  `);

  // Fund balances table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS fund_balances (
      fund_address TEXT NOT NULL,
      token_address TEXT NOT NULL,
      balance TEXT NOT NULL,
      human_balance REAL NOT NULL,
      last_updated INTEGER NOT NULL,
      PRIMARY KEY (fund_address, token_address),
      FOREIGN KEY (fund_address) REFERENCES funds(address)
    )
  `);

  // Tokens table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      address TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      decimals INTEGER NOT NULL,
      price REAL,
      last_updated INTEGER
    )
  `);

  // Strategies table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_address TEXT NOT NULL,
      executed_at INTEGER,
      status TEXT NOT NULL,
      tx_hash TEXT,
      strategy_data TEXT NOT NULL,
      reasoning TEXT,
      expected_return REAL,
      FOREIGN KEY (fund_address) REFERENCES funds(address)
    )
  `);

  logger.info("Database tables created successfully");
}

async function getDb() {
  if (!db) {
    await setupDatabase();
  }
  return db;
}

module.exports = {
  setupDatabase,
  getDb,
};
