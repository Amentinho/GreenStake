import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Loader2, RefreshCw, ArrowRight, ExternalLink } from "lucide-react";
import { useNexus } from "@/hooks/use-nexus";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { availTestnet } from "@/config/chains";

export function CrossChainBridgeCard() {
  const { isInitialized, initError, isLoading, unifiedBalances, fetchUnifiedBalances, address } = useNexus();
  const [hasLoadedBalances, setHasLoadedBalances] = useState(false);
  const { toast } = useToast();

  // Fetch balances when initialized
  useEffect(() => {
    if (isInitialized && !hasLoadedBalances && !isLoading) {
      fetchUnifiedBalances().then(() => {
        setHasLoadedBalances(true);
      });
    }
  }, [isInitialized, hasLoadedBalances, isLoading, fetchUnifiedBalances]);

  const handleRefreshBalances = async () => {
    try {
      await fetchUnifiedBalances();
      toast({
        title: "Balances Refreshed",
        description: "Your cross-chain balances have been updated.",
      });
    } catch (error) {
      console.error('Failed to refresh balances:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch cross-chain balances.",
        variant: "destructive",
      });
    }
  };

  if (!address) {
    return (
      <Card className="border-dashed opacity-80" data-testid="card-cross-chain-bridge">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Cross-Chain Bridge</CardTitle>
          </div>
          <CardDescription>
            Cross-chain balance viewer (Mainnet chains only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Connect wallet to view cross-chain balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-cross-chain-bridge">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Cross-Chain Bridge</CardTitle>
            <Badge variant="outline" className="ml-2">
              {isInitialized ? "Live" : "Initializing"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshBalances}
            disabled={!isInitialized || isLoading}
            data-testid="button-refresh-balances"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Cross-chain bridging powered by Nexus SDK (supports Ethereum, Polygon, Arbitrum, Base, and other mainnet chains)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SDK Status */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Nexus SDK Status</span>
            <Badge variant={isInitialized ? "default" : initError ? "destructive" : "secondary"}>
              {isInitialized ? "Connected" : initError ? "Config Needed" : "Connecting..."}
            </Badge>
          </div>
          {initError ? (
            <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
              {initError}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Network: Testnet</div>
              <div>Chains: 2</div>
              <div className="col-span-2 text-xs mt-1">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </div>
            </div>
          )}
        </div>

        {/* Supported Chains */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Supported Networks</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card" data-testid="chain-sepolia">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{sepolia.name}</div>
                  <div className="text-xs text-muted-foreground">Chain ID: {sepolia.id}</div>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card" data-testid="chain-avail">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{availTestnet.name}</div>
                  <div className="text-xs text-muted-foreground">Chain ID: {availTestnet.id}</div>
                </div>
              </div>
              <Badge variant="outline">Testnet</Badge>
            </div>
          </div>
        </div>

        {/* Unified Balances */}
        {initError ? (
          <div className="rounded-lg border border-dashed bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">Integration Status</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Nexus SDK integration is available for mainnet chains. For testnet bridging (Sepolia, Base Sepolia), direct chain transfers are used instead of chain abstraction.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Next steps for production:</strong> Add vite-plugin-node-polyfills or configure Vite's define/optimizeDeps for Buffer support.
                </p>
              </div>
            </div>
          </div>
        ) : isInitialized && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Unified Balances</h4>
            {isLoading && !hasLoadedBalances ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading cross-chain balances...</span>
              </div>
            ) : unifiedBalances.length > 0 ? (
              <div className="space-y-2">
                {unifiedBalances.map((asset, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    data-testid={`balance-${(asset as any).token || idx}`}
                  >
                    <div>
                      <div className="font-medium">{(asset as any).token || (asset as any).symbol || 'Asset'}</div>
                      <div className="text-xs text-muted-foreground">
                        {(asset as any).chainId ? `Chain ${(asset as any).chainId}` : 'Cross-chain'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {(asset as any).formatted || (asset as any).balance || '0'}
                      </div>
                      {(asset as any).usdValue && (
                        <div className="text-xs text-muted-foreground">
                          ${(asset as any).usdValue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/20">
                <p className="text-sm">No balances detected</p>
                <p className="text-xs mt-1">Add tokens to your wallet on supported chains</p>
              </div>
            )}
          </div>
        )}

        {/* Bridge Demo Notice */}
        <div className="rounded-lg border border-dashed bg-muted/10 p-4">
          <div className="flex items-start gap-3">
            <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Nexus SDK Integration Status</div>
              <p className="text-xs text-muted-foreground mb-3">
                {isInitialized ? (
                  <>Nexus SDK successfully initialized! Cross-chain balance aggregation active. Full bridge & execute functionality coming in Q1 2026 with contract upgrades.</>
                ) : initError ? (
                  <>SDK architecture integrated. {initError} See status card above for details.</>
                ) : (
                  <>Initializing Nexus SDK...</>
                )}
              </p>
              <a
                href="https://docs.availproject.org/api-reference/avail-nexus-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                data-testid="link-nexus-docs"
              >
                View Nexus SDK Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* SDK Info */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <div className="flex items-center justify-between">
            <span>Powered by Nexus SDK</span>
            <Badge variant="outline" className="text-xs">v1.1.0</Badge>
          </div>
          <p>
            Unified balance aggregation • Smart routing • Chain abstraction
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
