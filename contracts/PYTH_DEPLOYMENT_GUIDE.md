# GreenStakeDEX with Pyth Oracle - Deployment Guide

## Overview
This guide walks you through deploying the upgraded GreenStakeDEX contract with Pyth Network oracle integration for real-time energy pricing.

## What Changed?
- ✅ Added Pyth Network oracle integration
- ✅ Real-time ETH/USD pricing (proxy for energy pricing)
- ✅ `updatePriceFeeds()` function for on-chain price updates
- ✅ `getCurrentEnergyPrice()` view function
- ✅ Slippage protection (±10%) using oracle prices
- ✅ Frontend auto-calculates PYUSD amounts from live prices

## Prerequisites
- Rabby or MetaMask wallet with Sepolia ETH
- Access to Remix IDE: https://remix.ethereum.org/
- Your current contract: `0x92a110B7a64c5A692D1E1CDd5494E03eCa598F57` (will be replaced)

## Step 1: Deploy Updated Contract

### In Remix IDE:

1. **Create New File**: `GreenStakeDEX.sol`

2. **Copy Contract Code**: 
   - Open `contracts/GreenStakeDEX.sol` in Replit
   - Copy entire contents
   - Paste into Remix

3. **Compile**:
   - Click "Solidity Compiler" tab
   - Select compiler: **0.8.20** or higher
   - Click "Compile GreenStakeDEX.sol"

4. **Deploy**:
   - Click "Deploy & Run Transactions" tab
   - Environment: **"Injected Provider - Rabby"**
   - Make sure Rabby is on **Sepolia testnet**
   - **IMPORTANT**: Fill in constructor parameter:
     ```
     _PYTHADDRESS: 0x2880aB155794e7179c9eE2e38200202908C17B43
     ```
     (This is Pyth's Sepolia contract address)
   - Click **Deploy**
   - Approve transaction in Rabby (~0.002 ETH gas)
   - Wait for confirmation (~15 seconds)

5. **Copy New Contract Address**:
   - Find your deployed contract under "Deployed Contracts"
   - Copy the address (e.g., `0xNEWADDRESS...`)

## Step 2: Update Frontend Configuration

1. **Update Contract Address**:
   ```typescript
   // In client/src/lib/constants.ts - Line 16
   export const CONTRACT_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS';
   ```

2. **Restart App** (automatic in Replit)

## Step 3: Test Integration

### Test Sequence:

1. **Connect Wallet**
   - Open your app
   - Connect Rabby wallet
   - Ensure you're on Sepolia

2. **Generate Forecast**
   - Click "Generate Forecast"
   - Should see predicted kWh (e.g., 1300)

3. **Stake ETH**
   - Enter amount: `0.05` ETH
   - Click "Stake with ZKP"
   - Approve in Rabby
   - Wait for confirmation
   - You'll see your stake on Etherscan

4. **Verify Live Price**
   - In TradeCard, you should see:
     ```
     Live Energy Price: $XXXX.XX/ETH
     Powered by Pyth Network Oracle
     ```

5. **Execute Trade with Oracle**
   - Trade amount will auto-calculate based on live price
   - Click "Execute with Pyth Oracle"
   - **Two transactions will be requested**:
     
     **Transaction 1**: Update Price Feeds
     - Fee: ~0.001 ETH
     - Purpose: Push latest Pyth price to contract
     - Status: "Updating Oracle..."
     
     **Transaction 2**: Execute Trade
     - Uses fresh oracle price
     - Protected by ±10% slippage tolerance
     - Status: "Executing Trade..."

6. **Verify on Etherscan**
   - Click Etherscan links in success toasts
   - You'll see:
     - `TradeExecuted` event with `energyPrice` parameter
     - `PriceUpdated` event (from Pyth update)

## Step 4: Verify Pyth Integration

### Check Contract Functions:

In Remix "Deployed Contracts" panel, test:

1. **getCurrentEnergyPrice()**:
   - Should return: `[price, expo, publishTime]`
   - Example: `[2850000000000, -8, 1761172000]`
   - Actual price = `2850000000000 / 10^8` = $2,850

2. **ETH_USD_PRICE_ID()**:
   - Should return: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`

3. **pyth()**:
   - Should return: `0x2880aB155794e7179c9eE2e38200202908C17B43`

## Pyth Network Details

### What We're Using:
- **Network**: Ethereum Sepolia Testnet
- **Pyth Contract**: `0x2880aB155794e7179c9eE2e38200202908C17B43`
- **Price Feed**: ETH/USD (ID: `0xff61...0ace`)
- **Purpose**: Proxy for energy pricing (until electricity feeds available)
- **Data Source**: Hermes API - `https://hermes.pyth.network`

### How It Works:
1. Frontend fetches latest price data from Hermes
2. User pays small fee (~0.001 ETH) to update on-chain price
3. Contract validates trade price against oracle (±10% tolerance)
4. Trade executes at fair market price

### Price Update Flow:
```
User Clicks Trade
    ↓
Frontend: Fetch price from Hermes
    ↓
Frontend: Call updatePriceFeeds() (TX 1)
    ↓
Contract: Store latest price
    ↓
Frontend: Call executeTrade() (TX 2)
    ↓
Contract: Validate price, execute trade
```

## Bounty Qualification

### Pyth Network Integration Checklist:
- ✅ Smart contract uses `IPyth` interface
- ✅ Constructor accepts Pyth contract address
- ✅ `executeTrade()` fetches live price via `getPriceNoOlderThan()`
- ✅ `updatePriceFeeds()` function implemented
- ✅ Frontend uses `@pythnetwork/pyth-evm-js` (v1.44.0)
- ✅ Price data fetched from Hermes API
- ✅ Slippage protection using oracle price
- ✅ Events emit oracle price data
- ✅ README documents Pyth integration

## Troubleshooting

### Price Not Updating?
- Check browser console for Hermes API errors
- Ensure you approved TX 1 (price update)
- Wait 3 seconds between price update and trade

### "Invalid Pyth price" Error?
- Price might be stale (>60 seconds old)
- Call `updatePriceFeeds()` first
- Frontend handles this automatically

### PYUSD Amount Outside Range?
- This is slippage protection (±10%)
- Price moved too much between fetch and execution
- Retry the trade

### High Gas Fees?
- Sepolia testnet gas should be ~0.002-0.003 ETH total
- Get free testnet ETH: https://sepoliafaucet.com/

## Next Steps for Production

1. **Add Real Electricity Feeds**:
   - Wait for Pyth to launch electricity price feeds
   - Update `PRICE_FEED_ID` constant
   - Adjust price calculations for kWh instead of ETH

2. **Optimize Price Updates**:
   - Implement keeper/cron to update prices automatically
   - Users won't need to send separate price update TX
   - Lower costs

3. **Add Multiple Feeds**:
   - Regional electricity prices
   - Solar/wind energy pricing
   - Carbon credit pricing

## Resources

- **Pyth Docs**: https://docs.pyth.network/price-feeds
- **Price Feed IDs**: https://pyth.network/developers/price-feed-ids
- **Hermes API**: https://hermes.pyth.network/
- **Your Contract**: https://sepolia.etherscan.io/address/YOUR_NEW_ADDRESS

---

**Ready to Deploy?** Follow the steps above and you'll have real oracle-powered energy trading! 🚀
