import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Network, Loader2, CheckCircle2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface TradeCardProps {
  walletAddress: string;
  stakeCompleted: boolean;
}

type TradeStatus = 'idle' | 'bridging' | 'executing' | 'completed';

export function TradeCard({ walletAddress, stakeCompleted }: TradeCardProps) {
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTrade = async () => {
    if (!stakeCompleted) {
      toast({
        title: "Stake Required",
        description: "Please complete staking first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Create trade record with bridging status
      setTradeStatus('bridging');
      setProgress(0);

      const trade = await api.createTrade({
        walletAddress,
        fromChain: 'ethereum-sepolia',
        toChain: 'avail-testnet',
        etkAmount: '100',
        pyusdAmount: '100',
        status: 'bridging',
      });

      // Simulate Nexus bridging process
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(50);
      
      toast({
        title: "Bridging...",
        description: "Nexus is bridging ETK to Avail testnet",
      });

      // Step 2: Execute trade - update status to executed
      setTradeStatus('executing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(100);

      // Update the same trade record to executed status
      await api.updateTrade(trade.id, {
        status: 'executed',
        transactionHash: `0x${Math.random().toString(16).slice(2, 42)}`, // Mock tx hash
      });

      toast({
        title: "Trade Executed",
        description: "Successfully settled in PYUSD on Avail",
      });

      // Invalidate queries to refresh activity history
      queryClient.invalidateQueries({ queryKey: ['/api/trade', walletAddress] });

      setTradeStatus('completed');
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setTradeStatus('idle');
      setProgress(0);
    }
  };

  const isDisabled = !stakeCompleted || tradeStatus === 'bridging' || tradeStatus === 'executing';

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

        {/* Trade details */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-mono font-semibold">100 ETK</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">To (Settlement)</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-chart-3" />
              <span className="font-mono font-semibold">100 PYUSD</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Bridge Fee</span>
            <span className="font-mono text-xs">~0.01 ETH</span>
          </div>
        </div>

        {/* Progress indicator */}
        {(tradeStatus === 'bridging' || tradeStatus === 'executing') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tradeStatus === 'bridging' ? 'Bridging tokens...' : 'Executing trade...'}
              </span>
              <span className="font-mono text-xs">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Completed state */}
        {tradeStatus === 'completed' && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary font-medium">
              Trade completed! PYUSD settled on Avail testnet
            </p>
          </div>
        )}

        <Button
          onClick={handleTrade}
          className="w-full gap-2"
          disabled={isDisabled}
          data-testid="button-trade"
        >
          {tradeStatus === 'bridging' || tradeStatus === 'executing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
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
