import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

// Dynamic types - will be properly typed when SDK loads
type UserAsset = any;
type BridgeAndExecuteParams = any;
type BridgeAndExecuteResult = any;
type NexusSDKType = any;

/**
 * Hook to manage Avail Nexus SDK instance
 * Provides cross-chain bridging and execution capabilities
 */
export function useNexus() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [sdk, setSdk] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [unifiedBalances, setUnifiedBalances] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initRef = useRef(false);

  // Manual initialization function (called on-demand)
  const initializeNexus = useCallback(async () => {
    if (initRef.current || !isConnected) {
      return; // Already initialized or not connected
    }
    
    initRef.current = true;
    setIsLoading(true);
    
    try {
      // Load polyfills first and WAIT for Buffer to be ready
      const { setupBufferPolyfill } = await import('../polyfills');
      await setupBufferPolyfill();
      
      // Dynamically import Nexus SDK after polyfills are loaded
      const { NexusSDK } = await import('@avail-project/nexus');
      
      console.log('Attempting to initialize Nexus SDK...');
      const nexus = new NexusSDK({ network: 'testnet' });
      
      // Initialize with wallet provider
      if (window.ethereum) {
        await nexus.initialize(window.ethereum);
        setSdk(nexus);
        setIsInitialized(true);
        console.log('Nexus SDK initialized successfully!');
      }
    } catch (error) {
      console.error('Nexus SDK initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'SDK initialization failed');
      initRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);
    
  // Cleanup on disconnect
  useEffect(() => {
    if (!isConnected) {
      setSdk(null);
      setIsInitialized(false);
      setInitError(null);
      setUnifiedBalances([]);
      initRef.current = false;
    }
  }, [isConnected]);

  // Fetch unified balances across all chains
  const fetchUnifiedBalances = useCallback(async () => {
    if (!sdk || !isInitialized) return [];
    
    try {
      setIsLoading(true);
      const balances = await sdk.getUnifiedBalances();
      setUnifiedBalances(balances);
      return balances;
    } catch (error) {
      console.error('Failed to fetch unified balances:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized]);

  // Cross-chain transfer using Nexus SDK
  const transfer = useCallback(async (params: {
    token: string;      // Token symbol: 'ETH', 'USDC', etc.
    amount: string;     // Amount to transfer
    chainId: number;    // Destination chain ID  
    recipient: string;  // Destination address
  }): Promise<any> => {
    if (!sdk || !isInitialized) {
      throw new Error('Nexus SDK not initialized');
    }

    try {
      setIsLoading(true);
      
      // Set up intent approval hook - auto-approve for demo
      sdk.setOnIntentHook(({ allow }: any) => {
        console.log('Intent approval requested');
        allow();
      });

      // Set up allowance approval hook - auto-approve with minimum allowances
      sdk.setOnAllowanceHook(({ allow, sources }: any) => {
        console.log('Allowance approval requested for sources:', sources);
        const allowances = sources.map(() => 'min');
        allow(allowances);
      });

      console.log('Executing Nexus transfer:', params);
      const result = await sdk.transfer(params);
      console.log('Nexus transfer result:', result);
      
      return result;
    } catch (error) {
      console.error('Nexus transfer failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isInitialized]);

  return {
    sdk,
    isInitialized,
    initError,
    isLoading,
    unifiedBalances,
    address,
    initializeNexus,
    fetchUnifiedBalances,
    transfer,
  };
}
