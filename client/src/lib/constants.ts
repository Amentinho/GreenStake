// Smart contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Update after Remix deployment

// Mock PYUSD on Sepolia testnet
export const PYUSD_TESTNET = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'; // Real PYUSD Sepolia address

// Chain identifiers
export const CHAINS = {
  ETHEREUM_SEPOLIA: 'ethereum-sepolia',
  AVAIL_TESTNET: 'avail-testnet',
} as const;

// Transaction status types
export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  BRIDGING: 'bridging',
  EXECUTED: 'executed',
  FAILED: 'failed',
} as const;

// Energy token decimals
export const ETK_DECIMALS = 18;

// Default historical energy data for demo
export const DEFAULT_HISTORICAL_DATA = [1000, 1200, 1100, 1350, 1250];
