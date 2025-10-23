import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Loader2, Shield, Network } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface ActivityHistoryProps {
  walletAddress: string;
}

export function ActivityHistory({ walletAddress }: ActivityHistoryProps) {
  const { data: stakes, isLoading: stakesLoading } = useQuery({
    queryKey: ['/api/stake', walletAddress],
    queryFn: () => api.getStakes(walletAddress),
    enabled: !!walletAddress,
  });

  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/trade', walletAddress],
    queryFn: () => api.getTrades(walletAddress),
    enabled: !!walletAddress,
  });

  const isLoading = stakesLoading || tradesLoading;

  const activities = [
    ...(stakes || []).map(s => ({
      type: 'stake' as const,
      id: s.id,
      amount: s.amount,
      energyNeed: s.energyNeed,
      status: s.status,
      timestamp: new Date(s.timestamp),
    })),
    ...(trades || []).map(t => ({
      type: 'trade' as const,
      id: t.id,
      etkAmount: t.etkAmount,
      pyusdAmount: t.pyusdAmount,
      fromChain: t.fromChain,
      toChain: t.toChain,
      status: t.status,
      timestamp: new Date(t.timestamp),
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10">
            <History className="h-5 w-5 text-chart-5" />
          </div>
          <div>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Your stakes and trades</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Complete your first forecast and stake!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 hover-elevate"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  activity.type === 'stake' ? 'bg-primary/10' : 'bg-chart-2/10'
                }`}>
                  {activity.type === 'stake' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <Network className="h-4 w-4 text-chart-2" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {activity.type === 'stake' 
                        ? 'ZKP Stake' 
                        : (activity.fromChain === activity.toChain ? 'On-Chain Trade' : 'Cross-Chain Trade')
                      }
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      activity.status === 'confirmed' || activity.status === 'executed'
                        ? 'bg-primary/10 text-primary'
                        : activity.status === 'pending' || activity.status === 'bridging'
                        ? 'bg-chart-3/10 text-chart-3'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {activity.type === 'stake' ? (
                      <>
                        <div>Amount: <span className="font-mono">{activity.amount} ETK</span></div>
                        <div>Energy Need: <span className="font-mono">{activity.energyNeed} kWh</span></div>
                      </>
                    ) : (
                      <>
                        <div>
                          {activity.fromChain === activity.toChain 
                            ? `${activity.fromChain}` 
                            : `${activity.fromChain.split('-')[0]} → ${activity.toChain.split('-')[0]}`
                          }
                        </div>
                        <div>
                          <span className="font-mono">{activity.etkAmount} ETK</span> → <span className="font-mono">{activity.pyusdAmount} PYUSD</span>
                        </div>
                      </>
                    )}
                    <div className="text-xs text-muted-foreground/70 pt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
