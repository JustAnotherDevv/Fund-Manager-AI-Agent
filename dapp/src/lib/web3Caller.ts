import {
  Address,
  PublicClient,
  WalletClient,
  parseAbi,
  parseEther,
  parseUnits,
} from "viem";
import { AIFundABI, AIFundRegistryABI, ERC20ABI } from "./contracts/abi.ts";
import { getContractAddress } from "./contracts/addresses";
import {
  AIManager,
  CreateFundResult,
  TokenBalance,
  Transaction,
} from "./contracts/types";
import { getAccount } from "wagmi/actions";

export const web3Caller = {
  // Registry Read Functions
  async getActiveAIManagers(
    client: PublicClient,
    chainId: number
  ): Promise<Address[]> {
    const registryAddress = getContractAddress(chainId, "AIFundRegistry");

    return client.readContract({
      address: registryAddress,
      abi: AIFundRegistryABI,
      functionName: "getActiveAIManagers",
    });
  },

  async getAllAIManagers(
    client: PublicClient,
    chainId: number
  ): Promise<Address[]> {
    const registryAddress = getContractAddress(chainId, "AIFundRegistry");

    return client.readContract({
      address: registryAddress,
      abi: AIFundRegistryABI,
      functionName: "getAllAIManagers",
    });
  },

  async getAIManagerDetails(
    client: PublicClient,
    chainId: number,
    managerAddress: Address
  ): Promise<AIManager> {
    const registryAddress = getContractAddress(chainId, "AIFundRegistry");

    const details = (await client.readContract({
      address: registryAddress,
      abi: AIFundRegistryABI,
      functionName: "aiManagers",
      args: [managerAddress],
    })) as any;

    // Access supportedTokens directly from BaseAIManager implementation
    let supportedTokens: Address[] = [];
    try {
      // Call getSupportedTokens on the manager implementation contract
      supportedTokens = (await client.readContract({
        address: managerAddress,
        abi: parseAbi([
          "function getSupportedTokens() view returns (address[])",
        ]),
        functionName: "getSupportedTokens",
      })) as Address[];
    } catch (error) {
      console.error("Failed to get supported tokens:", error);
    }

    // Get token symbols for each supported token
    const supportedTokenSymbols = await Promise.all(
      supportedTokens.map(async (tokenAddress) => {
        return this.getTokenSymbol(client, tokenAddress);
      })
    );

    return {
      name: details.name || details[0],
      description: details.description || details[1],
      strategy: details.strategy || details[2],
      implementation: details.implementation || details[3],
      supportedTokens,
      supportedTokenSymbols,
      isActive: details.isActive || details[4],
      createdAt: details.createdAt || details[5],
    };
  },

  async getUserFunds(
    client: PublicClient,
    chainId: number,
    userAddress: Address
  ): Promise<Address[]> {
    const registryAddress = getContractAddress(chainId, "AIFundRegistry");

    return client.readContract({
      address: registryAddress,
      abi: AIFundRegistryABI,
      functionName: "getUserFunds",
      args: [userAddress],
    });
  },

  // Registry Write Functions
  async createFund(
    client: WalletClient,
    publicClient: PublicClient,
    chainId: number,
    managerAddress: Address
  ): Promise<CreateFundResult> {
    const registryAddress = getContractAddress(chainId, "AIFundRegistry");

    // Get the account from the wallet client
    const [account] = await client.getAddresses();

    if (!account) {
      throw new Error("No connected account");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: registryAddress,
        abi: AIFundRegistryABI,
        functionName: "createFund",
        args: [managerAddress],
        account,
      });

      const hash = await client.writeContract(request);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Find FundCreated event
      const fundCreatedEvent = receipt.logs
        .map((log) => {
          try {
            const event = publicClient.decodeEventLog({
              abi: AIFundRegistryABI,
              data: log.data,
              topics: log.topics,
            });
            return event?.eventName === "FundCreated" ? event : null;
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean)[0];

      if (!fundCreatedEvent) {
        console.error("FundCreated event not found in logs:", receipt.logs);

        // Rather than failing, try to get the fund address from the receipt's first log
        // This is a fallback in case event parsing fails
        const fundAddress =
          (receipt.logs[0]?.address as Address) ||
          "0x0000000000000000000000000000000000000000";

        return {
          fundAddress,
          transactionHash: hash,
        };
      }

      return {
        fundAddress: fundCreatedEvent.args.fundAddress as Address,
        transactionHash: hash,
      };
    } catch (error) {
      console.error("Error creating fund:", error);
      throw error;
    }
  },

  // Fund Read Functions
  async getFundOwner(
    client: PublicClient,
    fundAddress: Address
  ): Promise<Address> {
    return client.readContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "owner",
    });
  },

  async getFundAIManager(
    client: PublicClient,
    fundAddress: Address
  ): Promise<Address> {
    return client.readContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "aiManager",
    });
  },

  async getSupportedTokens(
    client: PublicClient,
    fundAddress: Address
  ): Promise<Address[]> {
    const tokenCount = await client.readContract({
      address: fundAddress,
      abi: parseAbi([
        "function supportedTokens(uint256) view returns (address)",
      ]),
      functionName: "supportedTokens",
      args: [0n],
    });

    // We don't know how many tokens there are, so we need to try reading them until we get an error
    const tokens: Address[] = [];
    if (tokenCount) {
      let index = 0n;
      let hasMore = true;

      while (hasMore) {
        try {
          const token = await client.readContract({
            address: fundAddress,
            abi: AIFundABI,
            functionName: "supportedTokens",
            args: [index],
          });
          tokens.push(token as Address);
          index += 1n;
        } catch (error) {
          hasMore = false;
        }
      }
    }

    return tokens;
  },

  async getTokenBalance(
    client: PublicClient,
    fundAddress: Address,
    tokenAddress: Address
  ): Promise<bigint> {
    return client.readContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "getBalance",
      args: [tokenAddress],
    });
  },

  async getAllBalances(
    client: PublicClient,
    fundAddress: Address
  ): Promise<TokenBalance[]> {
    const [tokens, balances] = (await client.readContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "getAllBalances",
    })) as [Address[], bigint[]];

    // Also get token symbols and decimals
    const tokenInfo = await Promise.all(
      tokens.map(async (token) => {
        try {
          const [symbol, decimals] = await Promise.all([
            client.readContract({
              address: token,
              abi: ERC20ABI,
              functionName: "symbol",
            }),
            client.readContract({
              address: token,
              abi: ERC20ABI,
              functionName: "decimals",
            }),
          ]);

          return { symbol, decimals };
        } catch (error) {
          return { symbol: "UNKNOWN", decimals: 18 };
        }
      })
    );

    return tokens.map((token, index) => ({
      token,
      balance: balances[index],
      symbol: tokenInfo[index].symbol as string,
      decimals: tokenInfo[index].decimals as number,
    }));
  },

  async getTransactionHistory(
    client: PublicClient,
    fundAddress: Address
  ): Promise<Transaction[]> {
    return client.readContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "getTransactionHistory",
    }) as Promise<Transaction[]>;
  },

  // Fund Write Functions
  async deposit(
    client: WalletClient,
    publicClient: PublicClient,
    fundAddress: Address,
    tokenAddress: Address,
    amount: string,
    decimals = 18
  ): Promise<`0x${string}`> {
    // Get the account from the wallet client
    const [account] = await client.getAddresses();

    if (!account) {
      throw new Error("No connected account");
    }

    // First approve the token transfer
    const parsedAmount = parseUnits(amount, decimals);

    const { request: approveRequest } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "approve",
      args: [fundAddress, parsedAmount],
      account,
    });

    const approveHash = await client.writeContract(approveRequest);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Then deposit
    const { request: depositRequest } = await publicClient.simulateContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "deposit",
      args: [tokenAddress, parsedAmount],
      account,
    });

    return client.writeContract(depositRequest);
  },

  async withdraw(
    client: WalletClient,
    publicClient: PublicClient,
    fundAddress: Address,
    tokenAddress: Address,
    amount: string,
    decimals = 18
  ): Promise<`0x${string}`> {
    // Get the account from the wallet client
    const [account] = await client.getAddresses();

    if (!account) {
      throw new Error("No connected account");
    }

    const parsedAmount = parseUnits(amount, decimals);

    const { request } = await publicClient.simulateContract({
      address: fundAddress,
      abi: AIFundABI,
      functionName: "withdraw",
      args: [tokenAddress, parsedAmount],
      account,
    });

    return client.writeContract(request);
  },

  // Token Utilities
  async getTokenBalance(
    client: PublicClient,
    tokenAddress: Address,
    ownerAddress: Address
  ): Promise<bigint> {
    return client.readContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [ownerAddress],
    });
  },

  async getTokenMetadata(
    client: PublicClient,
    tokenAddress: Address
  ): Promise<{ symbol: string; name: string; decimals: number }> {
    try {
      const [symbol, name, decimals] = await Promise.all([
        client.readContract({
          address: tokenAddress,
          abi: ERC20ABI,
          functionName: "symbol",
        }),
        client.readContract({
          address: tokenAddress,
          abi: ERC20ABI,
          functionName: "name",
        }),
        client.readContract({
          address: tokenAddress,
          abi: ERC20ABI,
          functionName: "decimals",
        }),
      ]);

      return {
        symbol: symbol as string,
        name: name as string,
        decimals: decimals as number,
      };
    } catch (error) {
      // Return a default in case the token doesn't implement ERC20 fully
      return {
        symbol: tokenAddress.substring(0, 6),
        name: "Unknown Token",
        decimals: 18,
      };
    }
  },

  async getTokenSymbol(
    client: PublicClient,
    tokenAddress: Address
  ): Promise<string> {
    try {
      const symbol = await client.readContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "symbol",
      });
      return symbol as string;
    } catch (error) {
      return (
        tokenAddress.substring(0, 6) +
        "..." +
        tokenAddress.substring(tokenAddress.length - 4)
      );
    }
  },
};
