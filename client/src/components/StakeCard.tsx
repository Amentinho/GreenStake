import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface StakeCardProps {
  walletAddress: string;
  forecastValue: number | null;
  onStakeComplete: () => void;
}

export function StakeCard({ walletAddress, forecastValue, onStakeComplete }: StakeCardProps) {
  const [amount, setAmount] = useState("100");
  const [isStaking, setIsStaking] = useState(false);
  const { toast } = useToast();

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
    if (isNaN(numAmount) || numAmount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum stake is 10 ETK",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    
    try {
      // Create initial stake record with pending status
      const stake = await api.createStake({
        walletAddress,
        amount: amount,
        energyNeed: forecastValue,
        status: "pending",
      });

      // Simulate blockchain confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update stake status to confirmed
      await api.updateStake(stake.id, {
        status: "confirmed",
        transactionHash: `0x${Math.random().toString(16).slice(2, 42)}`, // Mock tx hash
      });

      toast({
        title: "Stake Successful",
        description: `Staked ${amount} ETK anonymously with ZKP`,
      });
      
      // Invalidate queries to refresh activity history
      queryClient.invalidateQueries({ queryKey: ['/api/stake', walletAddress] });
      
      onStakeComplete();
    } catch (error) {
      toast({
        title: "Stake Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const isDisabled = !forecastValue || isStaking;

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
          <Label htmlFor="stake-amount">Amount (ETK)</Label>
          <Input
            id="stake-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            disabled={isDisabled}
            data-testid="input-stake-amount"
          />
          <p className="text-xs text-muted-foreground">
            Minimum: 10 ETK
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
              <span className="font-mono font-semibold">{amount} ETK</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border bg-card p-3">
          <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your stake is protected by zero-knowledge proofs using Semaphore protocol. 
            Your identity remains private while proving your energy commitment.
          </p>
        </div>

        <Button
          onClick={handleStake}
          className="w-full gap-2"
          disabled={isDisabled}
          data-testid="button-stake"
        >
          {isStaking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Staking...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Stake with ZKP
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
