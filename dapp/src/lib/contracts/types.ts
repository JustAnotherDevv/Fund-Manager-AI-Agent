import { Address } from "viem";

export type AIManager = {
  name: string;
  description: string;
  strategy: string;
  implementation: Address;
  supportedTokens: Address[];
  supportedTokenSymbols?: string[];
  isActive: boolean;
  createdAt: bigint;
};

export type Transaction = {
  token: Address;
  amount: bigint;
  isDeposit: boolean;
  timestamp: bigint;
};

export type TokenBalance = {
  token: Address;
  balance: bigint;
  symbol?: string;
  decimals?: number;
};

export type CreateFundResult = {
  fundAddress: Address;
  transactionHash: `0x${string}`;
};
