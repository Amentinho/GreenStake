# GreenStakeDEX Smart Contract Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create a new file: `GreenStakeDEX.sol`

### Step 2: Copy Contract Code
Copy the simplified contract from `contracts/GreenStakeDEX.sol` into Remix

### Step 3: Compile
1. Click **Solidity Compiler** tab (left sidebar)
2. Select compiler version: **0.8.20** or higher
3. Click **Compile GreenStakeDEX.sol**
4. Ensure no errors

### Step 4: Deploy to Sepolia
1. Click **Deploy & Run Transactions** tab
2. **Environment**: Select "Injected Provider - MetaMask" (or Rabby)
3. Make sure Rabby/MetaMask is on **Sepolia testnet**
4. Click **Deploy**
5. Approve the transaction in your wallet
6. Wait for deployment confirmation

### Step 5: Copy Contract Address
1. After deployment, find your contract under "Deployed Contracts"
2. Copy the contract address (starts with `0x...`)
3. **Save this address** - you'll need it in the next step

Example deployed address: `0x1234567890123456789012345678901234567890`

### Step 6: Update Frontend Configuration
Update the contract address in the app:

```bash
# You'll receive the deployed address and update it in:
# client/src/lib/constants.ts
```

### Step 7: Verify on Blockscout (Optional)
1. Go to https://eth-sepolia.blockscout.com/
2. Search for your contract address
3. Click "Verify & Publish"
4. Upload contract source code
5. This makes transactions easier to read

## Contract Functions

### `stake(uint256 energyNeed)`
- **Payable**: Send ETH with transaction (minimum 0.01 ETH)
- **Parameter**: `energyNeed` - Predicted energy in kWh
- **Emits**: `Staked` event

### `executeTrade(string fromChain, string toChain, uint256 etkAmount, uint256 pyusdAmount)`
- **Parameters**:
  - `fromChain`: "ethereum-sepolia"
  - `toChain`: "avail-testnet"  
  - `etkAmount`: Amount to trade (in wei)
  - `pyusdAmount`: PYUSD settlement amount
- **Emits**: `TradeExecuted` event

### `withdraw(uint256 amount)`
- **Parameter**: `amount` - Amount to withdraw in wei
- **Withdraws**: Your staked ETH back to your wallet

### View Functions
- `getUserStakes(address)` - Get user's stake history
- `getUserTrades(address)` - Get user's trade history  
- `getStats()` - Get platform TVL and activity stats
- `totalStaked(address)` - Get user's total staked balance

## Testing with Remix

After deployment, you can test directly in Remix:

1. **Test Stake**:
   - Expand deployed contract
   - Enter `energyNeed`: `1300` (kWh)
   - Enter value: `0.1` (ETH)
   - Click **stake**
   - Approve in wallet

2. **Test Trade**:
   - Call `executeTrade` with:
     - `fromChain`: `"ethereum-sepolia"`
     - `toChain`: `"avail-testnet"`
     - `etkAmount`: `100000000000000000` (0.1 ETH in wei)
     - `pyusdAmount`: `100`
   - Approve in wallet

3. **View History**:
   - Call `getUserStakes` with your address
   - Call `getUserTrades` with your address

## Troubleshooting

**Error: "Minimum stake is 0.01 ETH"**
- Solution: Send at least 0.01 ETH (10000000000000000 wei) with stake transaction

**Error: "Insufficient staked balance"**
- Solution: Stake tokens first before trading

**Deployment fails**
- Ensure you're on Sepolia testnet
- Make sure you have Sepolia ETH for gas
- Try increasing gas limit in Remix settings

## Next Steps

After deployment, share your contract address and I'll integrate it into the frontend to enable real on-chain transactions!
