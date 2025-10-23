# GreenStakeDEX V2 Deployment Guide

## What's Fixed in V2

✅ **Pyth Oracle Made Optional** - Trades work even if Pyth price updates fail (uses fallback price)
✅ **Gas Limit Fixed** - Optimized gas usage with explicit gas limits on transfers
✅ **Withdraw Function** - Users can now unstake and withdraw their ETH
✅ **Better Error Messages** - More descriptive error handling

## Step-by-Step Deployment

### 1. Open Remix IDE
Go to: https://remix.ethereum.org/

### 2. Create New Contract File
- Click the "+" icon in the file explorer
- Name it: `GreenStakeDEX_V2.sol`
- Copy the entire contents from `contracts/GreenStakeDEX_V2.sol` in this project

### 3. Compile the Contract
- Click the "Solidity Compiler" tab (left sidebar)
- Select Compiler version: **0.8.20** or higher
- Click "Compile GreenStakeDEX_V2.sol"
- Wait for green checkmark ✅

### 4. Deploy to Sepolia Testnet

#### A. Configure MetaMask/Rabby
- Connect to **Sepolia Testnet**
- Ensure you have **at least 0.1 Sepolia ETH** for deployment
  - Get free Sepolia ETH from: https://sepoliafaucet.com/

#### B. Deploy Contract
1. Click "Deploy & Run Transactions" tab (left sidebar)
2. Select Environment: **"Injected Provider - MetaMask"** (or Rabby)
3. Confirm it shows "Sepolia (11155111)" network
4. In the constructor parameters, enter:
   ```
   _pythAddress: 0x2880aB155794e7179c9eE2e38200202908C17B43
   ```
   (This is Pyth's official Sepolia contract address)

5. Click **"Deploy"** button (orange)
6. Confirm the transaction in your wallet
7. Wait for deployment to confirm (usually 10-30 seconds)

### 5. Copy Contract Address
Once deployed:
- Look for the deployed contract under "Deployed Contracts" section
- Click the copy icon next to the contract address
- It will look like: `0xABC123...` (42 characters)

### 6. Update Frontend Configuration
In this Replit project:
1. Open `client/src/lib/constants.ts`
2. Find line 13: `export const CONTRACT_ADDRESS = '...'`
3. Replace the old address with your new V2 contract address:
   ```typescript
   export const CONTRACT_ADDRESS = '0xYOUR_NEW_V2_ADDRESS_HERE';
   ```
4. Save the file (app will auto-restart)

### 7. Test the Contract

#### Test 1: Verify Contract on Etherscan
1. Go to: https://sepolia.etherscan.io/
2. Paste your contract address in the search bar
3. You should see your contract with:
   - Balance: 0 ETH
   - Txn Count: 1 (creation transaction)
   - Contract Creator: Your wallet address

#### Test 2: Stake ETH
1. In the GreenStake app, connect your wallet
2. Click "Generate AI Forecast"
3. Enter 0.01 ETH as stake amount
4. Click "Stake with ZKP"
5. Confirm transaction in wallet
6. Wait for confirmation ✅

#### Test 3: Withdraw ETH (NEW!)
1. After staking, you'll see "Unstake / Withdraw" section
2. Shows your staked balance
3. Enter amount to withdraw (e.g., 0.01 ETH)
4. Click "Withdraw from Contract"
5. Confirm transaction
6. Your ETH will be returned to your wallet ✅

#### Test 4: Execute Trade
1. Ensure you have active stake balance
2. Enter trade amount (e.g., 0.005 ETH)
3. Click "Execute with Pyth Oracle"
4. Confirm transaction
5. Trade should execute successfully! ✅

## Key Improvements Explained

### Optional Pyth Integration
```solidity
function _getEnergyPrice() internal view returns (uint256) {
    try pyth.getPriceNoOlderThan(ETH_USD_PRICE_ID, 300) returns (...) {
        // Use Pyth price if available
    } catch {
        // Fall back to $3000 USD if Pyth fails
        return FALLBACK_ETH_PRICE;
    }
}
```
**Result**: Trades work even if Pyth oracle is down or price updates fail.

### Gas Optimizations
```solidity
(bool success, ) = owner.call{value: amount, gas: 10000}("");
```
**Result**: Explicit gas limits prevent out-of-gas errors on transfers.

### Withdraw Function
```solidity
function withdraw(uint256 amount) external {
    require(totalStaked[msg.sender] >= amount, "Insufficient balance");
    // ... deduct from balance ...
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Withdrawal failed");
}
```
**Result**: Users can now withdraw their staked ETH anytime!

## Troubleshooting

### "Insufficient fee for price update"
- **Solution**: V2 handles this gracefully with fallback pricing

### "Gas limit too low"
- **Solution**: V2 has optimized gas usage with explicit limits

### "Cannot withdraw"
- **Cause**: No active stake balance
- **Solution**: Stake some ETH first using the Stake card

### Contract deployment failed
- **Cause**: Insufficient Sepolia ETH for gas
- **Solution**: Get more from https://sepoliafaucet.com/

## Contract Addresses Reference

- **Pyth Oracle (Sepolia)**: `0x2880aB155794e7179c9eE2e38200202908C17B43`
- **PYUSD Testnet (Sepolia)**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Your V2 Contract**: Update in `constants.ts` after deployment

## Need Help?

If deployment fails or you encounter issues:
1. Check Sepolia ETH balance (need at least 0.1 ETH)
2. Verify network is Sepolia (Chain ID: 11155111)
3. Ensure Remix compiler version is 0.8.20+
4. Try refreshing Remix and redeploying

---

**Ready to deploy?** Follow steps 1-7 above, then test your deployment! 🚀
