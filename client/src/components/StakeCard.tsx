import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Lock, ExternalLink, ArrowUpFromLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI, MIN_STAKE_WEI } from "@/lib/constants";

interface StakeCardProps {
  walletAddress: string;
  forecastValue: number | null;
  onStakeComplete: () => void;
}

export function StakeCard({ walletAddress, forecastValue, onStakeComplete }: StakeCardProps) {
  const [amount, setAmount] = useState("0.01");
  const [unstakeAmount, setUnstakeAmount] = useState("0.01");
  const { toast } = useToast();
  
  // Stake transaction hooks
  const { data: hash, writeContract, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Unstake transaction hooks
  const { 
    data: unstakeHash, 
    writeContract: writeUnstake, 
    isPending: isUnstakeWriting, 
    error: unstakeWriteError 
  } = useWriteContract();
  const { 
    isLoading: isUnstakeConfirming, 
    isSuccess: isUnstakeConfirmed 
  } = useWaitForTransactionReceipt({
    hash: unstakeHash,
  });

  // Read staked balance from contract
  const { data: stakedBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getActiveStakeBalance',
    args: [walletAddress as `0x${string}`],
    query: {
      refetchInterval: 3000,
    },
  });

  const isStaking = isWriting || isConfirming;
  const isUnstaking = isUnstakeWriting || isUnstakeConfirming;

  // Handle successful stake transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      handleTransactionSuccess(hash);
    }
  }, [isConfirmed, hash]);

  // Handle successful unstake transaction
  useEffect(() => {
    if (isUnstakeConfirmed && unstakeHash) {
      handleUnstakeSuccess(unstakeHash);
    }
  }, [isUnstakeConfirmed, unstakeHash]);

  // Handle stake write errors
  useEffect(() => {
    if (writeError) {
      toast({
        title: "Transaction Failed",
        description: writeError.message.includes("user rejected") 
          ? "Transaction was rejected"
          : "Failed to submit transaction. Please try again.",
        variant: "destructive",
      });
    }
  }, [writeError]);

  // Handle unstake write errors
  useEffect(() => {
    if (unstakeWriteError) {
      toast({
        title: "Unstake Failed",
        description: unstakeWriteError.message.includes("user rejected") 
          ? "Transaction was rejected"
          : "Failed to submit unstake transaction. Please try again.",
        variant: "destructive",
      });
    }
  }, [unstakeWriteError]);

  const handleTransactionSuccess = async (txHash: string) => {
    try {
      // Save stake record to backend
      await api.createStake({
        walletAddress,
        amount: amount,
        energyNeed: forecastValue!,
        status: "confirmed",
        transactionHash: txHash,
      });

      toast({
        title: "Stake Successful! 🎉",
        description: (
          <div className="space-y-2">
            <p>Staked {amount} ETH for {forecastValue} kWh energy commitment</p>
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

      // Invalidate queries to refresh activity history and contract balances
      queryClient.invalidateQueries({ queryKey: ['/api/stake', walletAddress] });
      refetchBalance();
      
      onStakeComplete();
    } catch (error) {
      console.error("Failed to save stake:", error);
    }
  };

  const handleUnstakeSuccess = async (txHash: string) => {
    toast({
      title: "Unstake Successful! ✅",
      description: (
        <div className="space-y-2">
          <p>Withdrawn {unstakeAmount} ETH from contract</p>
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

    // Refresh balances
    queryClient.invalidateQueries({ queryKey: ['/api/stake', walletAddress] });
    refetchBalance();
  };

  const handleStake = async () => {
    if (!forecastValue) {
      toast({
        title: "Forecast Required",
        description: "Please generate an AI forecast first",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.01) {
      toast({
        title: "Invalid Amount",
        description: "Minimum stake is 0.01 ETH",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the smart contract stake function
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'stake',
        args: [BigInt(forecastValue)],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error("Stake error:", error);
      toast({
        title: "Stake Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleUnstake = async () => {
    const numUnstakeAmount = parseFloat(unstakeAmount);
    if (isNaN(numUnstakeAmount) || numUnstakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to unstake",
        variant: "destructive",
      });
      return;
    }

    const stakedBalanceEth = stakedBalance ? Number(stakedBalance) / 1e18 : 0;
    if (numUnstakeAmount > stakedBalanceEth) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${stakedBalanceEth.toFixed(4)} ETH staked`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the smart contract withdraw function
      writeUnstake({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'withdraw',
        args: [parseEther(unstakeAmount)],
      });
    } catch (error) {
      console.error("Unstake error:", error);
      toast({
        title: "Unstake Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const isDisabled = !forecastValue || isStaking || isUnstaking;
  const stakedBalanceEth = stakedBalance ? (Number(stakedBalance) / 1e18).toFixed(4) : "0.00";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>ZKP Staking</CardTitle>
            <CardDescription>Stake energy needs privately</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="stake-amount">Amount (ETH)</Label>
          <Input
            id="stake-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            disabled={isDisabled}
            data-testid="input-stake-amount"
          />
          <p className="text-xs text-muted-foreground">
            Minimum: 0.01 ETH on Sepolia testnet
          </p>
        </div>

        {forecastValue && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Energy Need</span>
              <span className="font-mono font-semibold">{forecastValue} kWh</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stake Amount</span>
              <span className="font-mono font-semibold">{amount} ETH</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border bg-card p-3">
          <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your stake is recorded on-chain with your wallet address visible on Sepolia. 
            Zero-knowledge proof integration (Semaphore protocol) is planned for future privacy.
          </p>
        </div>

        <Button
          onClick={handleStake}
          className="w-full gap-2"
          disabled={isDisabled}
          data-testid="button-stake"
        >
          {isWriting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirm in Wallet...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming on Sepolia...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Stake Energy Commitment
            </>
          )}
        </Button>

        {/* Unstake Section */}
        {Number(stakedBalanceEth) > 0 && (
          <div className="border-t pt-6 space-y-4">
            <div>
              <Label htmlFor="unstake-amount" className="text-sm font-medium">Unstake / Withdraw</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Current staked balance: <span className="font-mono font-semibold">{stakedBalanceEth} ETH</span>
              </p>
            </div>

            <div className="space-y-2">
              <Input
                id="unstake-amount"
                type="number"
                step="0.01"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.01"
                disabled={isStaking || isUnstaking}
                data-testid="input-unstake-amount"
              />
            </div>

            <Button
              onClick={handleUnstake}
              className="w-full gap-2"
              variant="outline"
              disabled={isStaking || isUnstaking || Number(stakedBalanceEth) === 0}
              data-testid="button-unstake"
            >
              {isUnstakeWriting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirm in Wallet...
                </>
              ) : isUnstakeConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Withdrawal...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw from Contract
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
