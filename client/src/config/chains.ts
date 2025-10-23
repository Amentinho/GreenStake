import { defineChain } from 'viem';

/**
 * Custom chain definition for Avail Testnet
 * Network information from Avail documentation
 */
export const availTestnet = defineChain({
  id: 11822,
  name: 'Avail Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'AVAIL',
    symbol: 'AVAIL',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.availproject.org'],
    },
    public: {
      http: ['https://testnet-rpc.availproject.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Avail Explorer',
      url: 'https://testnet.availscan.com',
    },
  },
  testnet: true,
});
