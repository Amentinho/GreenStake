import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from '@wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Sepolia-focused configuration for GreenStake DEX
// All smart contract interactions happen on Sepolia testnet
export const config = createConfig({
  chains: [sepolia], // Primary chain: Ethereum Sepolia testnet
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
