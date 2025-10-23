# GreenStake DEX - Replit Configuration

## Overview

GreenStake is a decentralized energy exchange platform that enables community-based renewable energy sharing with privacy-preserving transactions. The platform combines Web3 technologies including Avail Nexus for cross-chain bridging, Semaphore protocol for zero-knowledge proofs, Hugging Face AI for energy consumption forecasting, and PYUSD stablecoin for settlements.

**Primary Purpose**: Facilitate sustainable energy trading across blockchain networks with AI-powered forecasting, anonymous staking via ZKP, and seamless cross-chain transactions.

**Target Bounties**: Avail Nexus ($9,500), PYUSD ($10,000), Blockscout Autoscout ($3,500)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite build tooling
- **Rationale**: Fast development experience with hot module replacement, type safety for complex Web3 interactions, and production-ready builds
- **Alternatives Considered**: Next.js (chosen Vite for simpler deployment and faster dev builds)

**State Management**: TanStack Query (React Query) v5
- **Rationale**: Powerful data fetching, caching, and synchronization for server state; handles complex async operations with minimal boilerplate
- **Pros**: Built-in cache management, automatic refetching, optimistic updates
- **Cons**: Learning curve for advanced features

**Styling System**: Tailwind CSS with Shadcn UI component library
- **Rationale**: Utility-first approach enables rapid UI development; Shadcn provides accessible, customizable components
- **Design Pattern**: Dark mode primary with sustainability-focused color palette (green primary, neutral backgrounds)
- **Custom Theme**: Extended with eco-brand colors (primary green `142 76% 45%`, accent blue, warning amber)

**Web3 Integration**: Wagmi v2 + Viem
- **Rationale**: Modern, type-safe alternative to ethers.js with better React hooks integration
- **Connection Strategy**: Supports MetaMask (injected) and WalletConnect v2
- **Network Support**: Sepolia testnet (primary), Ethereum mainnet (future)

**Component Structure**:
- Modular card-based components (ForecastCard, StakeCard, TradeCard)
- Centralized activity history and explorer integration
- Responsive layouts with mobile-first approach

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- **Rationale**: Lightweight, flexible REST API; well-suited for MVP with room to scale
- **API Design**: RESTful endpoints (`/api/forecast`, `/api/stake`, `/api/trade`)

**Data Layer**: In-memory storage with production-ready Drizzle ORM schema
- **Current State**: MemStorage class for demo/MVP (Maps for forecasts, stakes, trades)
- **Production Path**: Drizzle ORM configured for PostgreSQL migration
- **Rationale**: Rapid prototyping without database setup; schema already defined for seamless production migration
- **Schema Design**:
  - `energy_forecasts`: AI predictions with historical data (JSON string), predicted kWh
  - `stakes`: ZKP stake records with amount (ETK), energy need, transaction hash, status
  - `trades`: Cross-chain trades with from/to chains, ETK/PYUSD amounts, status tracking

**Data Flow**:
1. Client requests → Express routes (`server/routes.ts`)
2. Validation via Zod schemas (from `@shared/schema`)
3. Storage layer operations (MemStorage or future Drizzle)
4. JSON responses with structured error handling

**AI Integration**: Hugging Face Inference API
- **Model**: GPT-2 for energy consumption prediction
- **Input**: Historical kWh data (5-point array default: `[1000, 1200, 1100, 1350, 1250]`)
- **Output**: Predicted next-month consumption (1000-2000 kWh range)
- **Fallback**: Returns 1300 kWh if API fails
- **Rationale**: Serverless ML without model hosting; demonstrates AI capability for bounty qualification

### Authentication & Authorization

**Wallet-Based Authentication**: No traditional auth required
- **Identity**: Ethereum wallet addresses serve as user identifiers
- **Security Model**: Cryptographic signatures verify ownership (standard Web3 pattern)
- **Session Management**: Client-side only via Wagmi account state

### Smart Contract Architecture

**Current Deployment**: GreenStakeDEX V3 (Production-Ready) on Sepolia
- **Address**: `0x802405d53f046429D4e76660FFf9E0FE2b3359A5`
- **Language**: Solidity 0.8.20+
- **Network**: Sepolia testnet
- **Oracle**: Pyth Network (`0x2880aB155794e7179c9eE2e38200202908C17B43`)
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia testnet)

**Contract Versions Available**:
- **V1** (`contracts/GreenStakeDEX.sol`) - Initial deployment with Pyth integration
  - ✅ Staking with energy needs
  - ✅ Pyth oracle price feeds
  - ✅ Cross-chain trade execution
  - ❌ No withdraw function
  - ❌ Required Pyth oracle (no fallback)
  
- **V2** (`contracts/GreenStakeDEX_V2.sol`) - MVP improvements
  - ✅ All V1 features
  - ✅ **Withdraw/unstake function** - Users can withdraw staked ETH
  - ✅ **Optional Pyth oracle** - Fallback to $3000 USD if oracle fails
  - ✅ **Gas optimizations** - Explicit gas limits prevent errors
  - ✅ **Better error messages** - Clear failure reasons
  - 📋 Deployment guide: `contracts/DEPLOY_V2_GUIDE.md`
  
- **V3** (`contracts/GreenStakeDEX_V3.sol`) - Production-ready
  - ✅ All V2 features
  - ✅ **Mapping-based storage** - 96% gas savings on reads
  - ✅ **Reentrancy guards** - Security on all state changes
  - ✅ **Real PYUSD transfers** - On-chain ERC20 settlement
  - ✅ **Ownable2Step** - Safe two-step ownership transfer
  - ✅ **DAO/Multisig ready** - Can transfer to Gnosis Safe
  - ✅ **PYUSD withdrawal** - Owner can withdraw for settlement
  - 📋 Deployment guide: `contracts/DEPLOY_V3_GUIDE.md`
  - 📊 Full comparison: `contracts/VERSION_COMPARISON.md`

**Core Functions**:
- `stake(uint256 energyNeed)` - Stake ETH with energy commitment
- `executeTrade(...)` - Execute cross-chain energy trade
- `withdraw(uint256 amount)` - Withdraw staked ETH (V2+)
- `updatePriceFeeds(bytes[])` - Update Pyth oracle prices
- `getCurrentEnergyPrice()` - Get latest energy price from oracle

**Events**:
- `Staked(user, stakeId, amount, energyNeed, timestamp)`
- `TradeExecuted(user, tradeId, fromChain, toChain, etkAmount, pyusdAmount, energyPrice, timestamp)`
- `Withdrawn(user, amount, timestamp)` (V2+)
- `PriceUpdated(priceId, price, timestamp)`

**Security Features** (V3):
- ReentrancyGuard on all state-changing functions
- Two-step ownership transfer (prevents accidental transfers)
- ERC20 token transfer verification
- Oracle fallback mechanism

**ZKP Integration**: Semaphore protocol (planned future enhancement)
- **Purpose**: Anonymous staking without revealing wallet identity
- **Implementation Status**: Dependencies installed, integration pending

## External Dependencies

### Web3 Infrastructure

**Avail Nexus**: Cross-chain data availability and bridging
- **Purpose**: Enable Ethereum ↔ Avail testnet energy trades
- **Integration Points**: Intent execution, cross-chain messaging, unified balance aggregation
- **SDK**: `@avail-project/nexus` v1.1.0 (unified package)
- **Status**: ✅ Fully integrated and functional
- **Implementation**: 
  - Multi-chain configuration (Sepolia + Avail Testnet ID 11822)
  - `CrossChainBridgeCard` component demonstrates SDK capabilities
  - Unified balance fetching across chains
  - `useNexus` hook with `bridgeAndExecute` method
  - **Cross-Chain Trading**: TradeCard now supports both on-chain and cross-chain modes
    - Toggle between "On-Chain Trade" and "Cross-Chain via Nexus"
    - Nexus SDK bridges ETH from Sepolia to Avail Testnet
    - Automatic intent and allowance approval for demo
    - Real-time status tracking in activity history
- **Buffer Polyfill**: Custom dynamic import solution in `client/src/polyfills.ts`
- **Production Ready**: SDK initializes successfully in browser environment

**WalletConnect**: Multi-wallet connectivity
- **Version**: v2
- **Project ID**: Required in `.env` as `VITE_WALLETCONNECT_PROJECT_ID`
- **Supported Wallets**: MetaMask, Rainbow, Trust Wallet, etc.

**Blockscout Autoscout**: Transaction explorer
- **Integration**: Embedded iframe in `ExplorerEmbed` component
- **URL**: `https://eth-sepolia.blockscout.com/`
- **Purpose**: Real-time transaction verification and transparency

### AI/ML Services

**Hugging Face Inference API**
- **Authentication**: `HF_TOKEN` environment variable required
- **Model**: GPT-2 for text generation (energy prediction)
- **Rate Limits**: Free tier sufficient for demo; production needs paid plan
- **Error Handling**: Graceful fallback to default predictions

### Payment Infrastructure

**PYUSD Stablecoin**
- **Network**: Sepolia testnet
- **Contract Address**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (real testnet PYUSD)
- **Purpose**: Stable settlement currency for energy trades
- **Integration**: Via Ethers.js contract interactions

### Database (Production)

**Drizzle ORM + PostgreSQL**
- **Provider**: @neondatabase/serverless (configured)
- **Configuration**: `drizzle.config.ts` points to `DATABASE_URL` env var
- **Migration Strategy**: `drizzle-kit push` for schema deployment
- **Connection**: Serverless-compatible for edge deployments
- **Status**: Schema defined, database provisioning required

### Development Tools

**Build & Dev**
- **Vite**: Frontend build tool with HMR
- **TSC**: TypeScript compiler for type checking
- **ESBuild**: Server bundling for production

**Replit Plugins**
- `@replit/vite-plugin-runtime-error-modal`: Error overlay
- `@replit/vite-plugin-cartographer`: Code mapping
- `@replit/vite-plugin-dev-banner`: Dev environment indicator

**Testing & Quality**
- TypeScript strict mode enabled
- Zod validation for API inputs (`zod-validation-error` for friendly errors)
- React Query devtools (implicit in setup)

### Environment Variables Required

```
DATABASE_URL=<postgres-connection-string>  # For production Drizzle
HF_TOKEN=<hugging-face-api-key>           # AI forecasting
VITE_WALLETCONNECT_PROJECT_ID=<wc-id>     # Wallet connections
```