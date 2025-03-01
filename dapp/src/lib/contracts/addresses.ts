export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  HARDHAT: 31337,
} as const;

type ChainAddresses = {
  AIFundRegistry: `0x${string}`;
};

export const CONTRACT_ADDRESSES: Record<number, ChainAddresses> = {
  [CHAIN_IDS.MAINNET]: {
    AIFundRegistry: "0x0000000000000000000000000000000000000000",
  },
  [CHAIN_IDS.SEPOLIA]: {
    AIFundRegistry: "0x0000000000000000000000000000000000000000",
  },
  [CHAIN_IDS.HARDHAT]: {
    AIFundRegistry: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  },
};

export const getContractAddress = (
  chainId: number,
  contractName: keyof ChainAddresses
): `0x${string}` => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ID ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    throw new Error(
      `Contract ${contractName} not configured for chain ID ${chainId}`
    );
  }

  return address;
};
