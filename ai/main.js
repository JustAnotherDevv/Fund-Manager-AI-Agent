import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatUnits,
  parseUnits,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const PRICE_FEED_ABI = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
]);

const PRICE_FEEDS = {
  "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  "USDT/USD": "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  "DAI/USD": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  "FRAX/USD": "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
  "BUSD/USD": "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
};

const mainnetTransport = http(
  process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com"
);
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: mainnetTransport,
});

const sepoliaTransport = http(
  process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
);
const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: sepoliaTransport,
});

const account = privateKeyToAccount(
  process.env.PRIVATE_KEY ||
    "0x0000000000000000000000000000000000000000000000000000000000000000"
);
const sepoliaWalletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: sepoliaTransport,
});

const UNISWAP_ROUTER_ADDRESS = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
const UNISWAP_ROUTER_ABI = parseAbi([
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
]);

const TOKEN_ADDRESSES = {
  USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  USDT: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
  DAI: "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6",
  FRAX: "0xE5aFE81e63f0A52a3a03B922b30f73B8ce74D570",
  BUSD: "0x79f5e20996df8C69DCe02547A5eD6b36D2AA7e16",
};

const SAFE_ALTERNATIVE = {
  USDC: "DAI",
  USDT: "USDC",
  DAI: "USDC",
  FRAX: "DAI",
  BUSD: "USDC",
};

const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
  DAI: 18,
  FRAX: 18,
  BUSD: 18,
};

const executeSwap = async (fromSymbol, toSymbol, amount = "1000") => {
  const fromToken = fromSymbol.split("/")[0];
  const toToken = toSymbol.split("/")[0];

  const fromAddress = TOKEN_ADDRESSES[fromToken];
  const toAddress = TOKEN_ADDRESSES[toToken];
  const fromDecimals = TOKEN_DECIMALS[fromToken];

  if (!fromAddress || !toAddress) {
    console.log(
      `Cannot swap: invalid token symbols ${fromToken} -> ${toToken}`
    );
    return;
  }

  const amountIn = parseUnits(amount, fromDecimals);

  try {
    console.log(`🔄 Executing swap: ${amount} ${fromToken} -> ${toToken}`);

    const ERC20_ABI = parseAbi([
      "function approve(address spender, uint256 amount) external returns (bool)",
    ]);

    const approveTx = await sepoliaWalletClient.writeContract({
      address: fromAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [UNISWAP_ROUTER_ADDRESS, amountIn],
    });

    console.log(`✅ Approval transaction submitted: ${approveTx}`);
    await sepoliaPublicClient.waitForTransactionReceipt({ hash: approveTx });

    const path = [fromAddress, toAddress];
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    // hardcoded for 0.5% slippage
    const amountsOut = await sepoliaPublicClient.readContract({
      address: UNISWAP_ROUTER_ADDRESS,
      abi: UNISWAP_ROUTER_ABI,
      functionName: "getAmountsOut",
      args: [amountIn, path],
    });

    const expectedAmountOut = amountsOut[1];
    const minAmountOut =
      expectedAmountOut - (expectedAmountOut * BigInt(5)) / BigInt(1000); // 0.5% slippage

    const swapTx = await sepoliaWalletClient.writeContract({
      address: UNISWAP_ROUTER_ADDRESS,
      abi: UNISWAP_ROUTER_ABI,
      functionName: "swapExactTokensForTokens",
      args: [amountIn, minAmountOut, path, account.address, deadline],
    });

    console.log(`✅ Swap transaction submitted: ${swapTx}`);
    const receipt = await sepoliaPublicClient.waitForTransactionReceipt({
      hash: swapTx,
    });

    console.log(
      `✅ Swap complete! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Swap failed: ${error.message}`);
    return false;
  }
};

const logPrice = async (symbol, price) => {
  console.log(`${symbol}: $${price.toFixed(6)}`);

  if (price < 0.9) {
    const tokenSymbol = symbol.split("/")[0];
    const safeSymbol = SAFE_ALTERNATIVE[tokenSymbol];

    if (safeSymbol) {
      console.log(
        `⚠️ ${tokenSymbol} appears to be depegged (${price.toFixed(6)} < 0.90)`
      );
      await executeSwap(symbol, `${safeSymbol}/USD`);
    }
  }

  return { symbol, price };
};

const fetchPrice = async (symbol, address) => {
  try {
    const [roundData, decimals] = await Promise.all([
      mainnetClient.readContract({
        address,
        abi: PRICE_FEED_ABI,
        functionName: "latestRoundData",
      }),
      mainnetClient.readContract({
        address,
        abi: PRICE_FEED_ABI,
        functionName: "decimals",
      }),
    ]);

    const [, answer] = roundData;
    const price = Number(answer) / 10 ** Number(decimals);

    return await logPrice(symbol, price);
  } catch (error) {
    console.log(`${symbol}: Failed to fetch - ${error.message}`);
    return { symbol, price: null, error: error.message };
  }
};

const fetchAllPrices = async () => {
  console.log(
    `\n--- Stablecoin Price Feed Data --- ${new Date().toISOString()}`
  );

  for (const [symbol, address] of Object.entries(PRICE_FEEDS)) {
    await fetchPrice(symbol, address);
  }
};

const runMonitoring = async () => {
  while (true) {
    try {
      await fetchAllPrices();
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } catch (error) {
      console.error("Error in monitoring loop:", error);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }
};

process.on("SIGINT", () => {
  console.log("\nPrice feed monitoring stopped");
  process.exit(0);
});

console.log("Stablecoin price feed monitoring started (Press Ctrl+C to stop)");
runMonitoring();
