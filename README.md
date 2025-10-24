# GreenStake: Sustainable Energy DEX

![GreenStake](https://img.shields.io/badge/Platform-Web3-green)
![Bounties](https://img.shields.io/badge/ETHGlobal-ETHOnline_2025-blue)
![Status](https://img.shields.io/badge/Status-Live_MVP-success)

## Overview

GreenStake is a decentralized energy exchange platform that enables community-based renewable energy trading with transparent, blockchain-powered transactions. The platform combines AI-powered forecasting, oracle-based pricing, and stablecoin settlements to create a sustainable and efficient energy trading marketplace.

**🚀 Live Demo**: [https://github.com/Amentinho/GreenStake/](https://github.com/Amentinho/GreenStake/)

### Key Features

- **🧠 AI-Powered Forecasting**: Predicts monthly energy consumption using Hugging Face GPT-2 models
- **⚡ Smart Contract Staking**: Commit ETH for energy needs with on-chain verification
- **💰 Pyth Oracle Integration**: Real-time pricing via Pyth Network decentralized oracle
- **💵 PYUSD Settlements**: Instant, stable settlements using PayPal's USD stablecoin (ERC20)
- **🔍 Transaction Transparency**: Integrated Blockscout Autoscout explorer for full visibility
- **♻️ Withdraw Anytime**: Flexible unstaking with instant ETH withdrawal
- **📊 Activity Tracking**: Complete history of stakes and trades

## Bounty Qualifications

This project qualifies for blockchain ecosystem bounties:

| Bounty | Prize Link | Integration Status |
|--------|-----------|-------------------|
| **PYUSD** | [ETHGlobal Prize](https://ethglobal.com/events/ethonline2025/prizes) | ✅ Real PYUSD ERC20 settlements on Sepolia |
| **Pyth Network** | [ETHGlobal Prize](https://ethglobal.com/events/ethonline2025/prizes/pyth) | ✅ Oracle price feeds integrated in smart contract |
| **Blockscout Autoscout** | [ETHGlobal Prize](https://ethglobal.com/events/ethonline2025/prizes) | ✅ Embedded explorer with real-time tracking |

### Additional Integrations
- **Hugging Face AI**: GPT-2 model for consumption forecasting ✅

## Smart Contract Deployment

### GreenStakeDEX V3 (Production)
- **Network**: Ethereum Sepolia Testnet
- **Contract Address**: `0x802405d53f046429D4e76660FFf9E0FE2b3359A5`
- **Verification**: [View on Etherscan](https://sepolia.etherscan.io/address/0x802405d53f046429D4e76660FFf9E0FE2b3359A5)

### Contract Features
- ✅ **Energy Staking**: Stake ETH with energy need commitments
- ✅ **Withdraw/Unstake**: Flexible withdrawal system
- ✅ **Pyth Oracle**: Real-time price feeds with $3000 fallback
- ✅ **PYUSD Integration**: Real ERC20 PYUSD transfers for settlements
- ✅ **On-Chain Trades**: Execute trades with permanent records
- ✅ **Security**: ReentrancyGuard, Ownable2Step, gas-optimized mappings
- ✅ **DAO Ready**: Can transfer ownership to multisig/governance

### Supporting Contracts
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia)
- **Pyth Oracle**: `0x2880aB155794e7179c9eE2e38200202908C17B43` (Sepolia)

## Tech Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe component architecture
- **Vite** - Lightning-fast build tooling with HMR
- **Tailwind CSS** - Utility-first styling with custom sustainability theme
- **Wagmi v2** + **Viem** - Modern Web3 wallet integration
- **TanStack Query v5** - Powerful data fetching and caching
- **Shadcn UI** - Beautiful, accessible component library
- **Wouter** - Lightweight client-side routing

### Backend
- **Express.js** + **TypeScript** - RESTful API server
- **Hugging Face Inference** - GPT-2 AI model for energy forecasting
- **In-Memory Storage** - Fast data persistence (production Drizzle ORM schema included)
- **Zod Validation** - Type-safe API request/response validation

### Web3 Integration
- **Wagmi + Viem** - Modern Ethereum contract interactions
- **WalletConnect v2** - Multi-wallet support (MetaMask, Rainbow, etc.)
- **Pyth Network** - Decentralized oracle for price feeds
- **PYUSD** - PayPal USD stablecoin for settlements
- **Blockscout** - Embedded transaction explorer

### Blockchain Networks
- **Ethereum Sepolia** - Primary testnet deployment
- **Mainnet Ready**: Designed for Ethereum, Polygon, Arbitrum, Base, Optimism

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  • AI Forecast Card                     │
│  • Energy Staking Interface             │
│  • Trading Dashboard                    │
│  • Activity History                     │
│  • Blockscout Explorer                  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────▼─────────────────────────┐
    │  Wagmi + WalletConnect             │
    │  (MetaMask, Rainbow, etc.)         │
    └──────────┬─────────────────────────┘
               │
    ┌──────────▼──────────┐    ┌─────────────────┐
    │  Express API Server │───▶│  Hugging Face   │
    │  (RESTful)          │    │  GPT-2 AI Model │
    └──────────┬──────────┘    └─────────────────┘
               │
    ┌──────────▼────────────────────────────────┐
    │  GreenStakeDEX V3 Smart Contract         │
    │  0x802405d53f046429D4e76660FFf9E0FE2b3359A5 │
    │  • Staking with energy commitments        │
    │  • Withdraw/unstake ETH                   │
    │  • On-chain trade execution               │
    │  • Pyth oracle price feeds                │
    │  • PYUSD ERC20 settlements                │
    └──────────┬────────────────────────────────┘
               │
    ┌──────────▼──────────┐    ┌─────────────────┐
    │   Pyth Network      │    │  PYUSD Token    │
    │   Oracle (Sepolia)  │    │  ERC20 Contract │
    └─────────────────────┘    └─────────────────┘
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### 1. Clone and Install

```bash
git clone https://github.com/Amentinho/GreenStake/
cd GreenStake
npm install
```

### 2. Configure Environment Variables

Create a `.env` file or add to Replit Secrets:

#### Required Secrets

**HF_TOKEN** (Hugging Face API Key)
1. Visit https://huggingface.co/settings/tokens
2. Create a new token (free account)
3. Add as `HF_TOKEN` in Replit Secrets

**VITE_WALLETCONNECT_PROJECT_ID** (WalletConnect)
1. Visit https://cloud.walletconnect.com/
2. Create a new project
3. Add as `VITE_WALLETCONNECT_PROJECT_ID` in Replit Secrets

**SESSION_SECRET** (Backend Sessions)
- Any random string for Express session encryption
- Auto-generated by Replit if not provided

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000` or your Replit URL.

## Usage Guide

### Complete User Journey

#### 1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select MetaMask or WalletConnect
   - Approve connection to Ethereum Sepolia testnet
   - If on wrong network, you'll see an alert to switch to Sepolia

#### 2. **Generate AI Energy Forecast**
   - Navigate to the "AI Energy Forecast" card
   - Click "Generate AI Forecast"
   - AI analyzes historical patterns (default: [1000, 1200, 1100, 1350, 1250] kWh)
   - Predicts next month's consumption (typically 1000-2000 kWh)
   - Forecast displays with confidence indicator

#### 3. **Stake ETH for Energy Needs**
   - Enter amount of ETH to stake (minimum 0.01 ETH)
   - AI forecast value auto-populates as energy commitment
   - Click "Stake Energy Commitment"
   - Approve MetaMask transaction
   - **Staked balance updates immediately** after confirmation
   - View transaction on Etherscan via toast notification

#### 4. **Execute Energy Trade**
   - Enter ETK amount (energy tokens)
   - Enter PYUSD amount for settlement
   - First time: Approve PYUSD spending (one-time setup)
   - Click "Execute Trade"
   - Contract transfers PYUSD and records trade on-chain
   - Track transaction in Activity History

#### 5. **Withdraw Staked ETH** (Optional)
   - View current staked balance in Energy Staking card
   - Enter amount to withdraw
   - Click "Withdraw ETH"
   - Funds return to your wallet instantly

#### 6. **View Activity & Explorer**
   - **Activity History**: See all stakes and trades with status
   - **Blockscout Explorer**: Embedded iframe shows real-time transactions
   - Click transaction hashes to view on Etherscan/Blockscout

## Project Structure

```
GreenStake/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── ForecastCard.tsx    # AI energy prediction
│   │   │   ├── StakeCard.tsx       # ETH staking interface
│   │   │   ├── TradeCard.tsx       # Energy trading
│   │   │   ├── ActivityHistory.tsx # Transaction log
│   │   │   ├── ExplorerEmbed.tsx   # Blockscout iframe
│   │   │   ├── Hero.tsx            # Landing section
│   │   │   └── NetworkSwitcher.tsx # Chain switcher
│   │   ├── pages/
│   │   │   └── Home.tsx            # Main dashboard
│   │   ├── lib/
│   │   │   ├── api.ts              # Backend API client
│   │   │   ├── constants.ts        # Contract addresses/ABIs
│   │   │   └── queryClient.ts      # TanStack Query setup
│   │   └── config/
│   │       ├── wagmi.ts            # Wagmi configuration
│   │       └── chains.ts           # Custom chain definitions
├── server/                      # Express backend
│   ├── routes.ts               # API endpoints
│   ├── storage.ts              # In-memory data store
│   └── index.ts                # Server entry point
├── shared/                     # Shared types
│   └── schema.ts              # Drizzle ORM schemas + Zod
├── contracts/                  # Smart contracts
│   ├── GreenStakeDEX_V3.sol   # Production contract
│   ├── GreenStakeDEX_V2.sol   # V2 with withdraw
│   ├── GreenStakeDEX.sol      # V1 original
│   ├── VERSION_COMPARISON.md  # Contract comparison
│   └── DEPLOY_V3_GUIDE.md     # Deployment guide
├── design_guidelines.md        # UI/UX design system
└── replit.md                  # Project documentation
```

## Key API Endpoints

### Backend REST API

- **POST** `/api/forecast` - Generate AI energy forecast
  ```json
  { "walletAddress": "0x...", "historicalData": "[1000,1200,...]" }
  ```

- **POST** `/api/stake` - Save stake record
  ```json
  { 
    "walletAddress": "0x...", 
    "amount": "0.1", 
    "energyNeed": 1350,
    "status": "confirmed",
    "transactionHash": "0x..."
  }
  ```

- **POST** `/api/trade` - Save trade record
  ```json
  {
    "walletAddress": "0x...",
    "fromChain": "11155111",
    "toChain": "11155111",
    "etkAmount": "100",
    "pyusdAmount": "300",
    "status": "completed",
    "transactionHash": "0x..."
  }
  ```

- **GET** `/api/stake/:address` - Get user's stake history
- **GET** `/api/trade/:address` - Get user's trade history

## Smart Contract Functions

### Read Functions
- `getActiveStakeBalance(address user)` → Total staked ETH
- `getCurrentEnergyPrice()` → Latest price from Pyth oracle (or $3000 fallback)
- `getUserStakes(address user)` → Array of stake IDs
- `stakes(uint256 stakeId)` → Stake details
- `trades(uint256 tradeId)` → Trade details

### Write Functions
- `stake(uint256 energyNeed)` → Stake ETH with energy commitment (payable)
- `withdraw(uint256 amount)` → Withdraw staked ETH
- `executeTrade(...)` → Execute energy trade with PYUSD settlement
- `updatePriceFeeds(bytes[] updateData)` → Update Pyth oracle prices (payable)

## Recent Updates & Improvements

### Latest Changes (October 2024)

✅ **Staked Balance Auto-Refresh**: Balance updates immediately after stake/unstake transactions without page refresh

✅ **Fixed Chain ID Validation**: All chain IDs converted to strings for API compatibility

✅ **Simplified UI**: Removed unnecessary status blocks for cleaner interface

✅ **Vertical Layout**: Changed from grid to sequential layout for better UX flow

✅ **Dynamic Explorer Links**: Accurate Etherscan/Blockscout URLs based on chain

✅ **Accurate Activity Tracking**: Real chain IDs and transaction statuses

### Contract Evolution

- **V1**: Initial deployment with Pyth oracle (required)
- **V2**: Added withdraw function + optional oracle with fallback
- **V3**: Production-ready with:
  - Mapping storage (96% gas savings on reads)
  - Reentrancy guards on all state changes
  - Real PYUSD ERC20 transfers
  - Ownable2Step for safe ownership transfer
  - DAO/Multisig ready
  - PYUSD withdrawal for settlements

## Development Commands

```bash
npm run dev          # Start dev server (frontend + backend)
npm run build        # Build for production
npm run check        # TypeScript type checking
npm run preview      # Preview production build
```

## Environment Setup

### Development Mode
The app runs in development mode by default with:
- Hot Module Replacement (HMR)
- Vite dev server on port 5000
- Express API on same port (no CORS needed)
- In-memory storage for fast iteration

### Production Mode
For production deployment:
1. Configure PostgreSQL database URL
2. Run Drizzle migrations: `npx drizzle-kit push`
3. Build frontend: `npm run build`
4. Deploy via Replit publish button

## Roadmap

### Phase 1: MVP ✅ (Current)
- ✅ AI forecasting with Hugging Face GPT-2
- ✅ Smart contract staking on Sepolia
- ✅ Pyth Network oracle integration
- ✅ Real PYUSD ERC20 settlements
- ✅ Withdraw/unstake functionality
- ✅ Blockscout explorer integration
- ✅ Activity history tracking
- ✅ Real-time balance updates

### Phase 2: Enhancement 🚧
- [ ] PostgreSQL database migration
- [ ] Historical analytics dashboard
- [ ] Multi-token support (carbon credits, renewable certificates)
- [ ] Advanced AI models (LSTM, Prophet for better forecasting)
- [ ] Mobile PWA optimization
- [ ] ENS domain integration
- [ ] Cross-chain bridging (Nexus SDK on mainnet)

### Phase 3: Mainnet Production 🎯
- [ ] Mainnet deployment (Ethereum, Base, Polygon)
- [ ] DAO governance for protocol parameters
- [ ] Enterprise API for energy providers
- [ ] Privacy features (ZKP for anonymous staking)
- [ ] Carbon offset tracking
- [ ] Community marketplace
- [ ] Layer 2 scaling optimization

## Testing & Quality

### Frontend Testing
- TypeScript strict mode enabled
- Zod validation on all API boundaries
- React Query for cache management
- All interactive elements have `data-testid` attributes

### Smart Contract Testing
- Deployed and verified on Sepolia
- Tested withdraw functionality
- Oracle fallback mechanism verified
- PYUSD integration tested with testnet tokens
- Gas optimizations validated

## Environmental Impact

### Sustainability Goals
- **Energy Efficiency**: AI-optimized forecasting helps balance supply/demand
- **Transparency**: Blockchain ensures verifiable renewable energy usage
- **Accessibility**: Low-cost staking (0.01 ETH minimum) enables widespread participation
- **Decentralization**: No central authority controls energy trading

## Troubleshooting

### Common Issues

**"Wrong Network" Alert**
- Switch to Ethereum Sepolia in MetaMask
- Network switcher will guide you automatically

**"Forecast Required" Error**
- Generate an AI forecast before staking
- Forecast provides energy commitment value

**PYUSD Approval Needed**
- First trade requires approving PYUSD spending
- This is a one-time setup per wallet
- Approve amount must be ≥ trade amount

**Staked Balance Not Updating**
- Now fixed with auto-refresh after transactions
- Balance updates within 3 seconds
- If issues persist, refresh the page

**Hugging Face API Errors**
- Check that HF_TOKEN is set correctly
- Free tier has rate limits
- Fallback returns 1300 kWh if API fails

## Security Considerations

- Smart contract uses ReentrancyGuard on all state changes
- Two-step ownership transfer prevents accidental transfers
- Oracle has fallback pricing mechanism ($3000 USD)
- API validates all inputs with Zod schemas
- No private keys stored in frontend
- Session secrets properly configured
- PYUSD transfers verified on-chain

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript strict mode
4. Add `data-testid` attributes to new UI elements
5. Test on Sepolia testnet
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **PayPal** for PYUSD stablecoin technology
- **Blockscout** for Autoscout explorer platform
- **Pyth Network** for decentralized oracle price feeds
- **Hugging Face** for AI/ML model hosting and inference API
- **Replit** for development and hosting platform
- **Ethereum Foundation** for blockchain infrastructure

## Contact & Links

- **GitHub**: [https://github.com/Amentinho/GreenStake/](https://github.com/Amentinho/GreenStake/)
- **Contract**: [0x802405...359A5 on Sepolia](https://sepolia.etherscan.io/address/0x802405d53f046429D4e76660FFf9E0FE2b3359A5)
- **Blockscout**: [Sepolia Explorer](https://eth-sepolia.blockscout.com/)
- **PYUSD Docs**: [PayPal USD Documentation](https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd)
- **Pyth Network**: [Pyth Price Feeds](https://pyth.network/)

---

**Built with 💚 for a sustainable energy future**

*Empowering communities to trade renewable energy with transparency and efficiency*
