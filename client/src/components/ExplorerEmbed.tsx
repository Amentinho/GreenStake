import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExplorerEmbed() {
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
              href="https://eth-sepolia.blockscout.com/" 
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
        <div className="rounded-lg border-2 border-primary/30 overflow-hidden bg-card">
          <iframe
            src="https://eth-sepolia.blockscout.com/"
            title="GreenStake Transaction Explorer"
            className="w-full h-96 border-0"
            data-testid="iframe-explorer"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground text-center">
          All transactions are verified and viewable on Blockscout
        </p>
      </CardContent>
    </Card>
  );
}
