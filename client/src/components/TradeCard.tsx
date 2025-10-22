import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Network, Loader2, CheckCircle2, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAINS } from "@/lib/constants";

interface TradeCardProps {
  walletAddress: string;
  stakeCompleted: boolean;
}

type TradeStatus = 'idle' | 'executing' | 'completed';

export function TradeCard({ walletAddress, stakeCompleted }: TradeCardProps) {
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('idle');
  const [tradeAmount, setTradeAmount] = useState("0.01");
  const [pyusdAmount, setPyusdAmount] = useState("10");
  const { toast } = useToast();

  const { data: hash, writeContract, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
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

  const isTrading = isWriting || isConfirming;

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      handleTransactionSuccess(hash);
    }
  }, [isConfirmed, hash]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      toast({
        title: "Transaction Failed",
        description: writeError.message.includes("user rejected") 
          ? "Transaction was rejected"
          : "Failed to submit transaction. Please try again.",
        variant: "destructive",
      });
      setTradeStatus('idle');
    }
  }, [writeError]);

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
        title: "Trade Executed! 🎉",
        description: (
          <div className="space-y-2">
            <p>Cross-chain trade completed via Nexus</p>
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
      setTradeStatus('executing');

      // Call the smart contract executeTrade function
      writeContract({
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
    } catch (error) {
      console.error("Trade error:", error);
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
            <CardDescription>Bridge & execute via Nexus</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
              step="1"
              value={pyusdAmount}
              onChange={(e) => setPyusdAmount(e.target.value)}
              placeholder="10"
              disabled={isDisabled}
              data-testid="input-pyusd-amount"
            />
          </div>
        </div>

        {/* Trade summary */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-mono font-semibold">{tradeAmount} ETH</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">To (Settlement)</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-chart-3" />
              <span className="font-mono font-semibold">{pyusdAmount} PYUSD</span>
            </div>
          </div>
        </div>

        {/* Completed state */}
        {tradeStatus === 'completed' && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary font-medium">
              Trade completed! Settlement processed via Nexus
            </p>
          </div>
        )}

        <Button
          onClick={handleTrade}
          className="w-full gap-2"
          disabled={isDisabled}
          data-testid="button-trade"
        >
          {isWriting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirm in Wallet...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Executing Trade...
            </>
          ) : tradeStatus === 'completed' ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Trade Complete
            </>
          ) : (
            <>
              <Network className="h-4 w-4" />
              Execute Cross-Chain Trade
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
