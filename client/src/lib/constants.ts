/**
 * GreenStakeDEX Contract Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Deploy the contract from contracts/GreenStakeDEX.sol to Sepolia using Remix
 * 2. Copy the deployed contract address
 * 3. Update CONTRACT_ADDRESS below
 * 4. Restart the app
 */

// Deployed GreenStakeDEX contract on Sepolia testnet
export const CONTRACT_ADDRESS = '0x92a110B7a64c5A692D1E1CDd5494E03eCa598F57';

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

// Sepolia testnet chain ID
export const SEPOLIA_CHAIN_ID = 11155111;

// Minimum stake amount (0.01 ETH in wei)
export const MIN_STAKE_WEI = "10000000000000000"; // 0.01 ETH

// Contract ABI - Only the functions we need
export const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "energyNeed", "type": "uint256" }],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "fromChain", "type": "string" },
      { "internalType": "string", "name": "toChain", "type": "string" },
      { "internalType": "uint256", "name": "etkAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "pyusdAmount", "type": "uint256" }
    ],
    "name": "executeTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserStakes",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "energyNeed", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct GreenStakeDEX.Stake[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTrades",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "fromChain", "type": "string" },
          { "internalType": "string", "name": "toChain", "type": "string" },
          { "internalType": "uint256", "name": "etkAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "pyusdAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "completed", "type": "bool" }
        ],
        "internalType": "struct GreenStakeDEX.Trade[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      { "internalType": "uint256", "name": "tvl", "type": "uint256" },
      { "internalType": "uint256", "name": "stakesCount", "type": "uint256" },
      { "internalType": "uint256", "name": "tradesCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalStaked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getActiveStakeBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "energyNeed", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "fromChain", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "toChain", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "etkAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "pyusdAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TradeExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "settlementAddress", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TradeSettled",
    "type": "event"
  }
] as const;
