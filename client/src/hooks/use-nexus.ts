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

  // Initialize SDK when wallet is connected
  useEffect(() => {
    if (isConnected && walletClient && !initRef.current) {
      initRef.current = true;
      
      const initSdk = async () => {
        try {
          // Load polyfills first
          await import('../polyfills');
          
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
          setInitError(error instanceof Error ? error.message : 'SDK initialization failed. Requires vite.config.ts Buffer polyfill configuration.');
          initRef.current = false;
        }
      };
      
      initSdk();
    }
    
    // Cleanup on disconnect
    if (!isConnected) {
      setSdk(null);
      setIsInitialized(false);
      setInitError(null);
      setUnifiedBalances([]);
      initRef.current = false;
    }
  }, [isConnected, walletClient]);

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

  // Bridge and execute cross-chain trade
  const bridgeAndExecute = useCallback(async (
    params: BridgeAndExecuteParams
  ): Promise<BridgeAndExecuteResult | null> => {
    if (!sdk || !isInitialized) {
      throw new Error('Nexus SDK not initialized');
    }

    try {
      setIsLoading(true);
      
      // Set up intent approval hook
      sdk.setOnIntentHook(({ allow }) => {
        // Auto-approve for demo - in production, show UI confirmation
        allow();
      });

      // Set up allowance approval hook
      sdk.setOnAllowanceHook(({ allow }) => {
        // Auto-approve minimum allowances for demo
        allow(['min']);
      });

      const result = await sdk.bridgeAndExecute(params);
      return result;
    } catch (error) {
      console.error('Bridge and execute failed:', error);
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
    fetchUnifiedBalances,
    bridgeAndExecute,
  };
}
