# GreenStake DEX Design Guidelines

## Design Approach
**Selected Framework**: Hybrid approach combining Uniswap's clean DeFi patterns with sustainability-focused visual identity. This utility-first design prioritizes clarity for complex Web3 interactions while building trust through eco-conscious branding.

**Key References**: 
- Uniswap (clean trading interfaces, card-based layouts)
- Linear (modern typography, precise spacing)
- Stripe (subtle color usage, trustworthy aesthetic)

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: `222 15% 8%` - Deep charcoal base
- Surface: `222 12% 12%` - Elevated panels/cards
- Surface Elevated: `222 10% 16%` - Interactive elements
- Primary Green: `142 76% 45%` - Eco brand color (CTAs, success states, energy metrics)
- Primary Muted: `142 30% 25%` - Subdued green for backgrounds
- Text Primary: `0 0% 98%` - High contrast white
- Text Secondary: `0 0% 65%` - Muted gray for labels
- Border: `222 10% 20%` - Subtle separators
- Accent Blue: `217 91% 60%` - Blockchain/transaction indicators
- Warning Amber: `38 92% 50%` - Forecast alerts, pending states
- Error: `0 84% 60%` - Transaction failures

**Light Mode** (Optional toggle)
- Background: `0 0% 98%`
- Surface: `0 0% 100%`
- Primary Green: `142 71% 38%`
- Text: `222 20% 15%`

### B. Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) - UI text, data
- Monospace: 'JetBrains Mono' (Google Fonts) - Wallet addresses, transaction hashes, numerical data

**Scale**:
- Hero Heading: text-5xl/text-6xl (48-60px), font-bold
- Section Heading: text-3xl (30px), font-semibold
- Card Title: text-xl (20px), font-semibold
- Body: text-base (16px), font-normal
- Small/Labels: text-sm (14px), font-medium
- Micro/Captions: text-xs (12px), font-normal
- Data/Numbers: text-lg/text-2xl (18-24px), font-mono font-semibold

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Icon-text spacing: gap-2

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4
- Trading interface: max-w-4xl (focused workspace)
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stats/metrics: grid-cols-2 md:grid-cols-4

### D. Component Library

**Navigation**
- Sticky header with backdrop-blur-lg bg-surface/90
- Logo + primary nav links + wallet connection button (right)
- Icons: Heroicons outline style
- Height: h-16

**Cards & Surfaces**
- Background: bg-surface
- Border: border border-border
- Radius: rounded-xl (12px)
- Padding: p-6
- Hover: subtle border-primary-green/20 transition

**Wallet Connection**
- Prominent button: bg-primary-green text-white px-6 py-3 rounded-lg
- Connected state: Truncated address (0x1234...5678) with status indicator
- Disconnect: text-sm text-secondary hover:text-primary

**AI Forecast Section**
- Card with subtle green gradient background overlay
- Large numerical display: text-4xl font-mono text-primary-green
- Unit label (kWh) in text-sm text-secondary
- "Forecast" button: outline variant with icon

**ZKP Staking Interface**
- Input field: Dark bg-surface-elevated, border-border, focus:border-primary-green
- Amount display with ETK token icon
- Privacy indicator: Shield icon + "Anonymous Stake" label
- Submit button: Full-width bg-primary-green

**Trade Execution Panel**
- Two-column layout: From/To tokens
- Swap arrow icon between columns
- Chain badges (Ethereum → Avail) with chain logos
- PYUSD settlement indicator
- Progress states: pending/confirming/completed with icons

**Blockscout Explorer Embed**
- Full-width iframe with rounded-lg border-2 border-primary-green/30
- Header above iframe: "Transaction Explorer" with external link icon
- Min height: h-96

**Status Indicators**
- Success: Green dot + text-primary-green
- Pending: Amber pulse animation + text-warning
- Error: Red dot + text-error
- Icons from Heroicons (CheckCircle, Clock, ExclamationCircle)

### E. Animations

**Minimal Motion**
- Button hover: scale-[1.02] transition-transform duration-150
- Card hover: border color transition duration-200
- Loading states: Simple pulse animation
- No scroll-triggered or parallax effects

## Layout Sections

**Hero Area** (80vh)
- Large heading: "Sustainable Energy Trading, Cross-Chain"
- Subheading explaining Nexus + ZKP + AI
- Dual CTAs: "Connect Wallet" (primary) + "Learn More" (outline)
- Background: Subtle green radial gradient overlay on dark base
- Decorative elements: Grid pattern or abstract energy flow lines

**Dashboard Grid** (Main Interface)
- 3-column layout on desktop:
  - Left: Wallet status + forecast card
  - Center: Staking/trading interface (primary workspace)
  - Right: Transaction history + explorer embed
- Mobile: Single column stack

**Stats Bar**
- 4 metrics in row: Total Staked, Active Trades, Energy Saved (kWh), Carbon Offset
- Each metric: Icon + large number + label
- Background: bg-primary-green/5 border-l-4 border-primary-green

**Footer**
- Links: Docs, GitHub, Bounties
- Social icons
- Disclaimer about testnet usage
- Background: bg-surface border-t border-border

## Images

**Hero Background**: Abstract renewable energy visualization - wind turbines/solar panels silhouettes in dark green gradient, or circuit board pattern suggesting blockchain infrastructure. Low opacity (20-30%) behind text. Position: Hero section background, cover full viewport width.

**Icon Set**: Use Heroicons for all UI icons (wallet, shield for ZKP, lightning for energy, arrows for trades, chart for forecast). Size: w-5 h-5 for inline, w-8 h-8 for feature cards.

## Key Interaction Patterns

- Wallet connection triggers entire UI state change (disconnected → connected layout)
- Forecast button shows loading spinner, then animates number count-up
- Stake flow: Multi-step progress indicator (Forecast → Approve → Stake → Trade)
- Real-time transaction status updates in embedded explorer
- Error messages: Toast notifications (top-right, auto-dismiss)
- Form validation: Inline error messages below inputs

## Accessibility & Technical Notes

- Maintain WCAG AA contrast ratios (green on dark background tested)
- All interactive elements: min-h-11 for touch targets
- Dark mode by default with consistent implementation across forms/inputs
- Monospace fonts for all blockchain data (addresses, hashes)
- Loading states prevent accidental double-submissions
- Clear visual hierarchy: Primary actions in green, secondary in outline style