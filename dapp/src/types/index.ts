export interface Vault {
  id: string;
  name: string;
  description: string;
  strategy: string;
  tvl: number; // Total Value Locked
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  assets: string[];
  createdAt: Date;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
  aiAgent: {
    name: string;
    version: string;
    lastUpdate: Date;
  };
}

export interface User {
  id: string;
  address: string;
  balance: number;
  vaults: UserVault[];
}

export interface UserVault {
  vaultId: string;
  invested: number;
  share: number;
  joinedAt: Date;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';