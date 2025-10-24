import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export function CrossChainBridgeCard() {
  const { address } = useAccount();

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
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <CardTitle>Cross-Chain Bridge</CardTitle>
        </div>
        <CardDescription>
          Cross-chain bridging powered by Nexus SDK (supports Ethereum, Polygon, Arbitrum, Base, and other mainnet chains)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border bg-muted/10 p-6 text-center space-y-3">
          <Network className="h-12 w-12 mx-auto text-primary opacity-60" />
          <div>
            <h3 className="font-semibold mb-2">Mainnet Cross-Chain Bridging</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Nexus SDK only supports mainnet chains (Ethereum, Polygon, Arbitrum, Base, etc.).
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              For Sepolia → Base Sepolia bridging, use the official bridge:
            </p>
            <a
              href="https://bridge.base.org/deposit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              data-testid="link-base-bridge"
            >
              Official Base Bridge <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="text-xs text-muted-foreground pt-3 border-t">
            <p>Nexus integration will work seamlessly when deployed on mainnet!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
