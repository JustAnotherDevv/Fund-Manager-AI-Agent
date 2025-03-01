const { getDb } = require("./setup");

// Fund repository
const fundRepository = {
  async findByAddress(address) {
    const db = await getDb();
    return db.get("SELECT * FROM funds WHERE address = ?", address);
  },

  async findAll() {
    const db = await getDb();
    return db.all("SELECT * FROM funds ORDER BY last_updated DESC");
  },

  async save(fund) {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);

    await db.run(
      `INSERT INTO funds (address, owner, manager_address, manager_type, created_at, last_updated)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(address) DO UPDATE SET
         owner = excluded.owner,
         manager_address = excluded.manager_address,
         manager_type = excluded.manager_type,
         last_updated = excluded.last_updated`,
      [
        fund.address,
        fund.owner,
        fund.managerAddress,
        fund.managerType,
        fund.createdAt || now,
        now,
      ]
    );

    return this.findByAddress(fund.address);
  },

  async getBalances(fundAddress) {
    const db = await getDb();
    return db.all(
      `SELECT fb.*, t.symbol, t.decimals, t.price
       FROM fund_balances fb
       LEFT JOIN tokens t ON fb.token_address = t.address
       WHERE fb.fund_address = ?
       ORDER BY fb.human_balance DESC`,
      fundAddress
    );
  },

  async saveBalance(fundAddress, tokenAddress, balance, humanBalance) {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);

    await db.run(
      `INSERT INTO fund_balances (fund_address, token_address, balance, human_balance, last_updated)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(fund_address, token_address) DO UPDATE SET
         balance = excluded.balance,
         human_balance = excluded.human_balance,
         last_updated = excluded.last_updated`,
      [fundAddress, tokenAddress, balance.toString(), humanBalance, now]
    );
  },

  async deleteBalances(fundAddress) {
    const db = await getDb();
    await db.run(
      "DELETE FROM fund_balances WHERE fund_address = ?",
      fundAddress
    );
  },
};

// Token repository
const tokenRepository = {
  async findByAddress(address) {
    const db = await getDb();
    return db.get("SELECT * FROM tokens WHERE address = ?", address);
  },

  async save(token) {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);

    await db.run(
      `INSERT INTO tokens (address, symbol, decimals, price, last_updated)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(address) DO UPDATE SET
         symbol = excluded.symbol,
         decimals = excluded.decimals,
         price = excluded.price,
         last_updated = excluded.last_updated`,
      [token.address, token.symbol, token.decimals, token.price || null, now]
    );

    return this.findByAddress(token.address);
  },

  async updatePrice(address, price) {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);

    await db.run(
      `UPDATE tokens SET price = ?, last_updated = ? WHERE address = ?`,
      [price, now, address]
    );
  },
};

// Strategy repository
const strategyRepository = {
  async findById(id) {
    const db = await getDb();
    return db.get("SELECT * FROM strategies WHERE id = ?", id);
  },

  async findByFundAddress(fundAddress, limit = 10) {
    const db = await getDb();
    return db.all(
      "SELECT * FROM strategies WHERE fund_address = ? ORDER BY id DESC LIMIT ?",
      [fundAddress, limit]
    );
  },

  async save(strategy) {
    const db = await getDb();

    const result = await db.run(
      `INSERT INTO strategies (
         fund_address, executed_at, status, tx_hash, 
         strategy_data, reasoning, expected_return
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        strategy.fundAddress,
        strategy.executedAt || null,
        strategy.status || "pending",
        strategy.txHash || null,
        JSON.stringify(strategy.data),
        strategy.reasoning || null,
        strategy.expectedReturn || null,
      ]
    );

    return this.findById(result.lastID);
  },

  async updateStatus(id, status, txHash = null, executedAt = null) {
    const db = await getDb();

    await db.run(
      `UPDATE strategies SET status = ?, tx_hash = ?, executed_at = ? WHERE id = ?`,
      [
        status,
        txHash,
        executedAt ||
          (status === "executed" ? Math.floor(Date.now() / 1000) : null),
        id,
      ]
    );

    return this.findById(id);
  },
};

module.exports = {
  fundRepository,
  tokenRepository,
  strategyRepository,
};
