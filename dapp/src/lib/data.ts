import { Vault } from '@/types';

export const mockVaults: Vault[] = [
  {
    id: '1',
    name: 'Alpha Yield Optimizer',
    description: 'AI-driven yield farming strategy across multiple DeFi protocols',
    strategy: 'Multi-protocol Yield Optimization',
    tvl: 2450000,
    apy: 12.4,
    risk: 'Medium',
    assets: ['ETH', 'USDC', 'AAVE', 'CRV'],
    createdAt: new Date('2024-05-01'),
    performance: {
      daily: 0.05,
      weekly: 0.32,
      monthly: 1.2,
      allTime: 8.4,
    },
    aiAgent: {
      name: 'YieldBot',
      version: '2.3.1',
      lastUpdate: new Date('2024-06-15'),
    },
  },
  {
    id: '2',
    name: 'Delta Stablecoin Strategy',
    description: 'Conservative stablecoin yield strategy with automated rebalancing',
    strategy: 'Stablecoin Yield',
    tvl: 5780000,
    apy: 8.2,
    risk: 'Low',
    assets: ['USDC', 'USDT', 'DAI', 'FRAX'],
    createdAt: new Date('2024-04-15'),
    performance: {
      daily: 0.02,
      weekly: 0.15,
      monthly: 0.65,
      allTime: 3.2,
    },
    aiAgent: {
      name: 'StableGenius',
      version: '1.8.5',
      lastUpdate: new Date('2024-06-10'),
    },
  },
  {
    id: '3',
    name: 'Gamma DeFi Momentum',
    description: 'Aggressive strategy targeting high-growth DeFi protocols',
    strategy: 'DeFi Momentum',
    tvl: 1250000,
    apy: 22.8,
    risk: 'High',
    assets: ['ETH', 'LINK', 'UNI', 'SNX', 'COMP'],
    createdAt: new Date('2024-05-20'),
    performance: {
      daily: 0.12,
      weekly: 0.85,
      monthly: 3.4,
      allTime: 12.6,
    },
    aiAgent: {
      name: 'MomentumMaster',
      version: '3.1.0',
      lastUpdate: new Date('2024-06-18'),
    },
  },
  {
    id: '4',
    name: 'Omega L1 Staking',
    description: 'Diversified staking across major L1 blockchains',
    strategy: 'Cross-Chain Staking',
    tvl: 3850000,
    apy: 9.6,
    risk: 'Medium',
    assets: ['ETH', 'SOL', 'AVAX', 'ATOM', 'DOT'],
    createdAt: new Date('2024-03-10'),
    performance: {
      daily: 0.03,
      weekly: 0.22,
      monthly: 0.95,
      allTime: 5.8,
    },
    aiAgent: {
      name: 'StakeWise',
      version: '2.0.4',
      lastUpdate: new Date('2024-06-12'),
    },
  },
  {
    id: '5',
    name: 'Sigma LP Strategy',
    description: 'Automated liquidity provision with impermanent loss protection',
    strategy: 'Liquidity Provision',
    tvl: 2120000,
    apy: 15.3,
    risk: 'Medium',
    assets: ['ETH-USDC', 'BTC-ETH', 'ETH-LINK'],
    createdAt: new Date('2024-04-05'),
    performance: {
      daily: 0.06,
      weekly: 0.42,
      monthly: 1.8,
      allTime: 7.2,
    },
    aiAgent: {
      name: 'LiquidityAI',
      version: '1.9.2',
      lastUpdate: new Date('2024-06-14'),
    },
  },
];

export const mockUser = {
  id: '1',
  address: '0x1234...5678',
  balance: 15.45,
  vaults: [
    {
      vaultId: '1',
      invested: 5000,
      share: 0.2,
      joinedAt: new Date('2024-05-10'),
    },
    {
      vaultId: '3',
      invested: 2500,
      share: 0.15,
      joinedAt: new Date('2024-05-25'),
    },
  ],
};

export function getVaultById(id: string): Vault | undefined {
  return mockVaults.find(vault => vault.id === id);
}

export function getUserVaults(): Vault[] {
  return mockUser.vaults
    .map(userVault => {
      const vault = getVaultById(userVault.vaultId);
      return vault;
    })
    .filter((vault): vault is Vault => vault !== undefined);
}