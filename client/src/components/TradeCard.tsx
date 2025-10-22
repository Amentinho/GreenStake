import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Network, Loader2, CheckCircle2, DollarSign, ExternalLink, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAINS, ETH_USD_PRICE_ID, PYTH_CONTRACT_ADDRESS, PYTH_ABI } from "@/lib/constants";
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

interface TradeCardProps {
  walletAddress: string;
  stakeCompleted: boolean;
}

type TradeStatus = 'idle' | 'fetching-price' | 'updating-price' | 'executing' | 'completed';

export function TradeCard({ walletAddress, stakeCompleted }: TradeCardProps) {
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('idle');
  const [tradeAmount, setTradeAmount] = useState("0.01");
  const [pyusdAmount, setPyusdAmount] = useState("0");
  const [currentEnergyPrice, setCurrentEnergyPrice] = useState<string>("0");
  const { toast } = useToast();

  // Separate hooks for price update and trade execution
  const { 
    data: priceUpdateHash, 
    writeContract: writePriceUpdate, 
    isPending: isPriceUpdating,
    error: priceUpdateError 
  } = useWriteContract();
  
  const { 
    data: tradeHash, 
    writeContract: writeTradeExecution, 
    isPending: isTradeExecuting,
    error: tradeError 
  } = useWriteContract();

  const { isLoading: isPriceUpdateConfirming, isSuccess: isPriceUpdateConfirmed } = useWaitForTransactionReceipt({
    hash: priceUpdateHash,
  });
  
  const { isLoading: isTradeConfirming, isSuccess: isTradeConfirmed } = useWaitForTransactionReceipt({
    hash: tradeHash,
  });

  // Get user's staked balance (poll for real-time updates)
  const { data: stakedBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'totalStaked',
    args: [walletAddress as `0x${string}`],
    query: {
      refetchInterval: 2000, // Poll every 2 seconds for immediate balance updates
    },
  });

  // Get current energy price from contract
  const { data: energyPriceData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getCurrentEnergyPrice',
    query: {
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Update energy price display when data changes
  useEffect(() => {
    if (energyPriceData && Array.isArray(energyPriceData)) {
      const [price, expo] = energyPriceData;
      if (price && expo !== undefined) {
        const priceNumber = Number(price);
        const expoNumber = Number(expo);
        const actualPrice = priceNumber / Math.pow(10, -expoNumber);
        setCurrentEnergyPrice(actualPrice.toFixed(2));
        
        // Auto-calculate PYUSD amount based on ETH price
        const tradeEth = parseFloat(tradeAmount) || 0;
        const estimatedPyusd = (tradeEth * actualPrice).toFixed(2);
        setPyusdAmount(estimatedPyusd);
      }
    }
  }, [energyPriceData, tradeAmount]);

  const isTrading = isPriceUpdating || isPriceUpdateConfirming || isTradeExecuting || isTradeConfirming || tradeStatus === 'fetching-price' || tradeStatus === 'updating-price';

  // Handle price update confirmation - automatically proceed to trade
  useEffect(() => {
    if (isPriceUpdateConfirmed && priceUpdateHash) {
      toast({
        title: "Price Updated ✓",
        description: "Now executing your trade with fresh oracle price...",
      });
      
      // Automatically execute trade after price update confirms
      setTimeout(() => {
        executeTradeTx();
      }, 1000);
    }
  }, [isPriceUpdateConfirmed, priceUpdateHash]);

  // Handle successful trade execution
  useEffect(() => {
    if (isTradeConfirmed && tradeHash) {
      handleTransactionSuccess(tradeHash);
    }
  }, [isTradeConfirmed, tradeHash]);

  // Handle errors
  useEffect(() => {
    if (priceUpdateError) {
      console.error("Price update error:", priceUpdateError);
      
      const errorMessage = priceUpdateError.message || String(priceUpdateError);
      
      toast({
        title: "Price Update Failed",
        description: errorMessage.includes("user rejected") || errorMessage.includes("User rejected")
          ? "You rejected the transaction"
          : errorMessage.includes("insufficient funds")
          ? "Insufficient ETH for update fee (~0.002 ETH needed)"
          : `Error: ${errorMessage.substring(0, 100)}`,
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  }, [priceUpdateError]);

  useEffect(() => {
    if (tradeError) {
      toast({
        title: "Trade Failed",
        description: tradeError.message.includes("user rejected") 
          ? "Transaction was rejected"
          : "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  }, [tradeError]);

  const handleTransactionSuccess = async (txHash: string) => {
    try {
      setTradeStatus('completed');

      // Save trade record to backend
      await api.createTrade({
        walletAddress,
        fromChain: CHAINS.ETHEREUM_SEPOLIA,
        toChain: CHAINS.AVAIL_TESTNET,
        etkAmount: tradeAmount,
        pyusdAmount: pyusdAmount,
        status: 'executed',
        transactionHash: txHash,
      });

      toast({
        title: "Trade Executed with Pyth Oracle! 🎉",
        description: (
          <div className="space-y-2">
            <p>Traded at live market price: ${currentEnergyPrice}/ETH</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ),
      });

      // Invalidate queries to refresh activity history
      queryClient.invalidateQueries({ queryKey: ['/api/trade', walletAddress] });
      
      // Reset status after 2 seconds to allow another trade
      setTimeout(() => {
        setTradeStatus('idle');
      }, 2000);
    } catch (error) {
      console.error("Failed to save trade:", error);
    }
  };

  // Execute the trade transaction (called after price update confirms)
  const executeTradeTx = () => {
    setTradeStatus('executing');
    
    const tradeAmountWei = parseEther(tradeAmount);
    
    writeTradeExecution({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'executeTrade',
      args: [
        CHAINS.ETHEREUM_SEPOLIA,
        CHAINS.AVAIL_TESTNET,
        tradeAmountWei,
        BigInt(Math.floor(parseFloat(pyusdAmount) * 1e6)), // PYUSD has 6 decimals
      ],
    });
  };

  const handleTrade = async () => {
    if (!stakeCompleted) {
      toast({
        title: "Stake Required",
        description: "Please complete staking first",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(tradeAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    const tradeAmountWei = parseEther(tradeAmount);
    const stakedBalanceBigInt = stakedBalance ?? BigInt(0);

    if (stakedBalanceBigInt === BigInt(0)) {
      toast({
        title: "No Staked Balance",
        description: "You need to stake ETH first before trading",
        variant: "destructive",
      });
      return;
    }

    if (tradeAmountWei > stakedBalanceBigInt) {
      const stakedEth = (Number(stakedBalanceBigInt) / 1e18).toFixed(4);
      toast({
        title: "Insufficient Balance",
        description: `You only have ${stakedEth} ETH staked`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Fetch latest Pyth price update data
      setTradeStatus('fetching-price');
      toast({
        title: "Fetching Live Price...",
        description: "Getting latest energy price from Pyth Network",
      });

      const pythConnection = new EvmPriceServiceConnection('https://hermes.pyth.network');
      const priceUpdateData = await pythConnection.getPriceFeedsUpdateData([ETH_USD_PRICE_ID]);
      
      console.log('Pyth price update data:', priceUpdateData);

      // Step 2: Update price feeds on-chain (small fee required)
      setTradeStatus('updating-price');
      toast({
        title: "Updating Oracle Price...",
        description: "Submitting price update to contract (TX 1/2)",
      });

      // Use a reasonable fee for Sepolia testnet
      // Pyth typically requires ~0.0001-0.001 ETH on testnets
      const updateFee = parseEther("0.002"); // Increased to 0.002 ETH to ensure sufficient fee
      
      console.log('Calling updatePriceFeeds with fee:', updateFee.toString());
      
      writePriceUpdate({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'updatePriceFeeds',
        args: [priceUpdateData as `0x${string}`[]],
        value: updateFee,
      });
      
      // Note: The trade execution (TX 2/2) will automatically trigger
      // after the price update confirms (see useEffect above)
    } catch (error) {
      console.error("Trade error details:", error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  };

  const isDisabled = !stakeCompleted || isTrading || tradeStatus === 'completed';
  const stakedBalanceEth = stakedBalance ? (Number(stakedBalance) / 1e18).toFixed(4) : "0.00";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
            <Network className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <CardTitle>Cross-Chain Trade</CardTitle>
            <CardDescription>Pyth Oracle-powered pricing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live price indicator */}
        {currentEnergyPrice !== "0" && (
          <div className="rounded-lg border bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Live Energy Price</span>
              </div>
              <span className="text-lg font-bold text-primary">${currentEnergyPrice}/ETH</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Pyth Network Oracle
            </p>
          </div>
        )}

        {/* Chain visualization */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mb-2 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-500">ETH</span>
              </div>
            </div>
            <p className="text-xs font-medium">Ethereum</p>
            <p className="text-xs text-muted-foreground">Sepolia</p>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground mt-1">Nexus</span>
          </div>

          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mb-2 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">AVL</span>
              </div>
            </div>
            <p className="text-xs font-medium">Avail</p>
            <p className="text-xs text-muted-foreground">Testnet</p>
          </div>
        </div>

        {/* Staked balance display */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available to Trade</span>
            <span className="font-mono font-semibold">{stakedBalanceEth} ETH</span>
          </div>
        </div>

        {/* Trade amount inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trade-amount">Trade Amount (ETH)</Label>
            <Input
              id="trade-amount"
              type="number"
              step="0.01"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="0.01"
              disabled={isDisabled}
              data-testid="input-trade-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pyusd-amount">Settlement (PYUSD)</Label>
            <Input
              id="pyusd-amount"
              type="number"
              step="0.01"
              value={pyusdAmount}
              onChange={(e) => setPyusdAmount(e.target.value)}
              placeholder="Auto-calculated"
              disabled={isDisabled}
              data-testid="input-pyusd-amount"
            />
            <p className="text-xs text-muted-foreground">
              Auto-calculated from live oracle price
            </p>
          </div>
        </div>

        {/* Completed state */}
        {tradeStatus === 'completed' && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary font-medium">
              Trade completed at live oracle price!
            </p>
          </div>
        )}

        <Button
          onClick={handleTrade}
          className="w-full gap-2"
          disabled={isDisabled}
          data-testid="button-trade"
        >
          {tradeStatus === 'fetching-price' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching Price...
            </>
          ) : tradeStatus === 'updating-price' || isPriceUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating Oracle (TX 1/2)...
            </>
          ) : isPriceUpdateConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming Price Update...
            </>
          ) : isTradeExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirm Trade in Wallet...
            </>
          ) : isTradeConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Executing Trade (TX 2/2)...
            </>
          ) : tradeStatus === 'completed' ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Trade Complete
            </>
          ) : (
            <>
              <Network className="h-4 w-4" />
              Execute with Pyth Oracle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
