import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplorerEmbedProps {
  walletAddress?: string;
}

export function ExplorerEmbed({ walletAddress }: ExplorerEmbedProps) {
  const explorerUrl = walletAddress 
    ? `https://eth-sepolia.blockscout.com/address/${walletAddress}`
    : "https://eth-sepolia.blockscout.com/";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <Search className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Transaction Explorer</CardTitle>
              <CardDescription>Powered by Blockscout Autoscout</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            data-testid="button-open-explorer"
          >
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-1"
            >
              Open
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-muted/30 p-8 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium">View Your Transactions on Blockscout</p>
              <p className="text-xs text-muted-foreground">
                Blockscout doesn't support iframe embedding due to security policies (CORS). 
                Click "Open" above to view your wallet's transaction history, token balances, and smart contract interactions on Sepolia testnet.
              </p>
            </div>
          </div>
          
          <Button 
            asChild 
            className="w-full gap-2"
            data-testid="button-view-wallet"
          >
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Search className="h-4 w-4" />
              View {walletAddress ? 'Your Wallet' : 'Explorer'} on Blockscout
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">What you can see on Blockscout:</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• All your stake, trade, and withdrawal transactions</li>
            <li>• PYUSD token transfers and approvals</li>
            <li>• Smart contract interactions with GreenStakeDEX V3</li>
            <li>• Gas costs and transaction status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
