import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { NexusSDK } from '@avail-project/nexus';
import type { BridgeAndExecuteParams, BridgeAndExecuteResult, UserAsset } from '@avail-project/nexus';

/**
 * Hook to manage Avail Nexus SDK instance
 * Provides cross-chain bridging and execution capabilities
 */
export function useNexus() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [sdk, setSdk] = useState<NexusSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [unifiedBalances, setUnifiedBalances] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initRef = useRef(false);

  // Initialize SDK when wallet is connected
  useEffect(() => {
    if (isConnected && walletClient && !initRef.current) {
      initRef.current = true;
      const initSdk = async () => {
        try {
          // Create SDK instance for testnet
          const nexus = new NexusSDK({ network: 'testnet' });
          
          // Initialize with wallet provider
          if (window.ethereum) {
            await nexus.initialize(window.ethereum);
            setSdk(nexus);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('Failed to initialize Nexus SDK:', error);
          initRef.current = false;
        }
      };
      
      initSdk();
    }
    
    // Cleanup on disconnect
    if (!isConnected) {
      setSdk(null);
      setIsInitialized(false);
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
    params: Omit<BridgeAndExecuteParams, 'execute'> & {
      execute: {
        contractAddress: string;
        contractAbi: any[];
        functionName: string;
        buildFunctionParams: any;
        tokenApproval?: {
          token: string;
          amount: string;
        };
      };
    }
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
    isLoading,
    unifiedBalances,
    address,
    fetchUnifiedBalances,
    bridgeAndExecute,
  };
}
