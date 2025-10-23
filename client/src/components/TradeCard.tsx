import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Network, Loader2, CheckCircle2, DollarSign, ExternalLink, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatUnits, parseUnits } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAINS, ETH_USD_PRICE_ID, PYTH_CONTRACT_ADDRESS, PYTH_ABI, PYUSD_TESTNET, ERC20_ABI } from "@/lib/constants";
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { useNexus } from "@/hooks/use-nexus";

interface TradeCardProps {
  walletAddress: string;
  stakeCompleted: boolean;
}

type TradeStatus = 'idle' | 'fetching-price' | 'updating-price' | 'executing' | 'bridging' | 'completed';
type TradeMode = 'on-chain' | 'cross-chain';

export function TradeCard({ walletAddress, stakeCompleted }: TradeCardProps) {
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('idle');
  const [tradeMode, setTradeMode] = useState<TradeMode>('on-chain');
  const [tradeAmount, setTradeAmount] = useState("0.01");
  const [pyusdAmount, setPyusdAmount] = useState("0");
  const [currentEnergyPrice, setCurrentEnergyPrice] = useState<string>("0");
  const [priceUpdateData, setPriceUpdateData] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Nexus SDK for cross-chain bridging
  const { sdk, isInitialized: isNexusReady, bridgeAndExecute } = useNexus();

  // Separate hooks for PYUSD approval, price update, and trade execution
  const { 
    data: approvalHash, 
    writeContract: writeApproval, 
    isPending: isApproving,
    error: approvalError 
  } = useWriteContract();

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

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const { isLoading: isPriceUpdateConfirming, isSuccess: isPriceUpdateConfirmed } = useWaitForTransactionReceipt({
    hash: priceUpdateHash,
  });
  
  const { isLoading: isTradeConfirming, isSuccess: isTradeConfirmed } = useWaitForTransactionReceipt({
    hash: tradeHash,
  });

  // Handle PYUSD approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed && approvalHash) {
      console.log('PYUSD approval confirmed! Hash:', approvalHash);
      toast({
        title: "PYUSD Approved ✓",
        description: "Now executing your trade...",
      });
      
      // Refetch allowance
      refetchAllowance();
      
      // Automatically execute trade after approval confirms
      setTimeout(() => {
        console.log('Executing trade after approval...');
        executeTradeTx();
      }, 1000);
    }
  }, [isApprovalConfirmed, approvalHash]);

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

  // Get PYUSD balance
  const { data: pyusdBalance } = useReadContract({
    address: PYUSD_TESTNET as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: {
      refetchInterval: 5000,
    },
  });

  // Get PYUSD allowance for the contract
  const { data: pyusdAllowance, refetch: refetchAllowance } = useReadContract({
    address: PYUSD_TESTNET as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [walletAddress as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    query: {
      refetchInterval: 5000,
    },
  });

  // Get Pyth update fee for the price data
  const { data: updateFeeData } = useReadContract({
    address: PYTH_CONTRACT_ADDRESS as `0x${string}`,
    abi: PYTH_ABI,
    functionName: 'getUpdateFee',
    args: priceUpdateData.length > 0 ? [priceUpdateData as `0x${string}`[]] : undefined,
    query: {
      enabled: priceUpdateData.length > 0,
    },
  });

  // Log the update fee whenever it changes
  useEffect(() => {
    if (updateFeeData) {
      console.log('Pyth update fee data received:', updateFeeData);
    }
  }, [updateFeeData]);

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

  const isTrading = isApproving || isApprovalConfirming || isPriceUpdating || isPriceUpdateConfirming || isTradeExecuting || isTradeConfirming || tradeStatus === 'fetching-price' || tradeStatus === 'updating-price' || tradeStatus === 'bridging';

  // Handle price update confirmation - automatically proceed to trade
  useEffect(() => {
    if (isPriceUpdateConfirmed && priceUpdateHash) {
      console.log('Price update confirmed! Hash:', priceUpdateHash);
      toast({
        title: "Price Updated ✓",
        description: "Now executing your trade with fresh oracle price...",
      });
      
      // Automatically execute trade after price update confirms
      setTimeout(() => {
        console.log('Executing trade transaction...');
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
    if (approvalError) {
      console.error("PYUSD approval error:", approvalError);
      toast({
        title: "PYUSD Approval Failed",
        description: approvalError.message.includes("user rejected")
          ? "You rejected the approval transaction"
          : "Failed to approve PYUSD. Please try again.",
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  }, [approvalError]);

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

  // Execute the trade transaction (called after price update confirms OR directly)
  const executeTradeTx = () => {
    setTradeStatus('executing');
    toast({
      title: "Executing Trade...",
      description: "Please confirm the trade transaction (TX 2/2)",
    });
    
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

  // Approve PYUSD spending
  const approvePyusd = () => {
    setTradeStatus('executing');
    const pyusdAmountUnits = parseUnits(pyusdAmount, 6); // PYUSD has 6 decimals
    
    toast({
      title: "Approve PYUSD",
      description: "Please approve the contract to spend your PYUSD",
    });

    writeApproval({
      address: PYUSD_TESTNET as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS as `0x${string}`, pyusdAmountUnits],
    });
  };

  // Handle cross-chain trade via Nexus SDK
  const handleCrossChainTrade = async () => {
    if (!isNexusReady || !sdk) {
      toast({
        title: "Nexus Not Ready",
        description: "Please wait for Nexus SDK to initialize",
        variant: "destructive",
      });
      return;
    }

    try {
      setTradeStatus('bridging');
      toast({
        title: "Initiating Cross-Chain Trade",
        description: "Bridging from Ethereum Sepolia to Avail Testnet via Nexus...",
      });

      const tradeAmountWei = parseEther(tradeAmount);

      // Prepare bridge and execute params for Nexus SDK
      const result = await bridgeAndExecute({
        fromChain: 11155111, // Sepolia chain ID
        toChain: 11822, // Avail Testnet chain ID
        amount: tradeAmountWei.toString(),
        tokenAddress: '0x0000000000000000000000000000000000000000', // ETH
        destinationAddress: walletAddress,
      });

      console.log('Cross-chain trade result:', result);

      // Save trade record to backend
      await api.createTrade({
        walletAddress,
        fromChain: CHAINS.ETHEREUM_SEPOLIA,
        toChain: CHAINS.AVAIL_TESTNET,
        etkAmount: tradeAmount,
        pyusdAmount: pyusdAmount,
        status: 'bridging',
        transactionHash: result?.txHash || 'pending',
      });

      toast({
        title: "Cross-Chain Trade Initiated! 🌉",
        description: (
          <div className="space-y-2">
            <p>Your ETH is being bridged to Avail Testnet via Nexus</p>
            <p className="text-xs text-muted-foreground">
              Track your transaction on both chain explorers
            </p>
          </div>
        ),
      });

      queryClient.invalidateQueries({ queryKey: ['/api/trade', walletAddress] });
      setTradeStatus('completed');
      
      setTimeout(() => {
        setTradeStatus('idle');
      }, 3000);

    } catch (error) {
      console.error("Cross-chain trade error:", error);
      toast({
        title: "Cross-Chain Trade Failed",
        description: error instanceof Error ? error.message : "Failed to bridge to Avail Testnet",
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  };

  const handleTrade = async () => {
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

    // If cross-chain mode, use Nexus SDK
    if (tradeMode === 'cross-chain') {
      await handleCrossChainTrade();
      return;
    }

    // Check PYUSD balance for on-chain trades
    const pyusdBalanceBigInt = pyusdBalance ?? BigInt(0);
    const requiredPyusd = parseUnits(pyusdAmount, 6);
    
    if (pyusdBalanceBigInt < requiredPyusd) {
      toast({
        title: "Insufficient PYUSD",
        description: `You need ${pyusdAmount} PYUSD to execute this trade. Get testnet PYUSD from the faucet.`,
        variant: "destructive",
      });
      return;
    }

    // Check PYUSD allowance
    const allowanceBigInt = pyusdAllowance ?? BigInt(0);
    
    if (allowanceBigInt < requiredPyusd) {
      toast({
        title: "PYUSD Approval Needed",
        description: "You need to approve the contract to spend your PYUSD first",
      });
      
      // Approve PYUSD
      approvePyusd();
      return;
    }

    try {
      // PYUSD already approved, execute trade directly
      toast({
        title: "Executing Trade...",
        description: "Using current oracle price from contract",
      });
      
      executeTradeTx();
      
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

  // Allow trading if user has staked balance (from any session)
  const hasStakedBalance = stakedBalance && stakedBalance > BigInt(0);
  const isDisabled = !hasStakedBalance || isTrading || tradeStatus === 'completed';
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
          <div className="rounded-lg border bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">ETH/USD Price (Energy Proxy)</span>
              </div>
              <span className="text-lg font-bold text-primary" data-testid="text-energy-price">${currentEnergyPrice}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Pyth Network Oracle • Demo Pricing</p>
              <p>
                Uses ETH/USD price feed ($0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace) as proxy for energy costs. 
                Pyth publishes price updates ~1 second on-chain, but contract uses last fetched value. 
                Fallback: $3000 hardcoded if oracle unavailable. 
                <span className="font-medium">Note:</span> In production, would use dedicated kWh pricing oracle.
              </p>
            </div>
          </div>
        )}

        {/* Trade Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={tradeMode === 'on-chain' ? 'default' : 'outline'}
              onClick={() => setTradeMode('on-chain')}
              disabled={isTrading}
              className="flex-1"
              data-testid="button-mode-onchain"
            >
              On-Chain Trade
            </Button>
            <Button
              variant={tradeMode === 'cross-chain' ? 'default' : 'outline'}
              onClick={() => setTradeMode('cross-chain')}
              disabled={isTrading || !isNexusReady}
              className="flex-1 gap-2"
              data-testid="button-mode-crosschain"
            >
              <Sparkles className="h-4 w-4" />
              Cross-Chain via Nexus
            </Button>
          </div>
          {tradeMode === 'cross-chain' && !isNexusReady && (
            <p className="text-xs text-muted-foreground text-center">
              Connect wallet to enable cross-chain trading
            </p>
          )}
          {tradeMode === 'cross-chain' && isNexusReady && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Nexus SDK Ready
              </Badge>
            </div>
          )}
        </div>

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
            <ArrowRight className={`h-5 w-5 ${tradeMode === 'cross-chain' ? 'text-primary' : 'text-muted-foreground opacity-50'}`} />
            <span className={`text-xs mt-1 ${tradeMode === 'cross-chain' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {tradeMode === 'cross-chain' ? 'Nexus Bridge' : 'On-Chain'}
            </span>
          </div>

          <div className={`rounded-lg border p-4 text-center ${tradeMode === 'cross-chain' ? 'bg-primary/5 border-primary/20' : 'border-dashed bg-muted/30 opacity-60'}`}>
            <div className="mb-2 flex items-center justify-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tradeMode === 'cross-chain' ? 'bg-primary/10' : 'bg-muted'}`}>
                <span className={`text-xs font-bold ${tradeMode === 'cross-chain' ? 'text-primary' : 'text-muted-foreground'}`}>AVL</span>
              </div>
            </div>
            <p className={`text-xs font-medium ${tradeMode === 'cross-chain' ? 'text-primary' : 'text-muted-foreground'}`}>
              Avail {tradeMode === 'cross-chain' && 'Testnet'}
            </p>
            <p className="text-xs text-muted-foreground">
              {tradeMode === 'cross-chain' ? 'Active' : 'Select Mode'}
            </p>
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
              Auto-calculated: {tradeAmount || 0} ETH × ${currentEnergyPrice} = {pyusdAmount} PYUSD
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
          disabled={isDisabled || (tradeMode === 'cross-chain' && !isNexusReady)}
          data-testid="button-trade"
        >
          {tradeStatus === 'bridging' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Bridging to Avail...
            </>
          ) : tradeStatus === 'fetching-price' ? (
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
              {tradeMode === 'cross-chain' ? 'Bridge Complete' : 'Trade Complete'}
            </>
          ) : (
            <>
              {tradeMode === 'cross-chain' ? <Sparkles className="h-4 w-4" /> : <Network className="h-4 w-4" />}
              {tradeMode === 'cross-chain' ? 'Bridge to Avail via Nexus' : 'Execute with Pyth Oracle'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
