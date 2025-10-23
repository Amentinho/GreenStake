import { Button } from "@/components/ui/button";
import { Wallet, Leaf, ExternalLink } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from '@wagmi/connectors';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none">GreenStake</h1>
            <p className="text-xs text-muted-foreground">Sustainable Energy DEX</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a 
            href="https://github.com/Amentinho/GreenStake/blob/main/README.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-docs"
          >
            Docs
            <ExternalLink className="h-3 w-3" />
          </a>
          <a 
            href="https://github.com/Amentinho/GreenStake/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-github"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              className="gap-2"
              data-testid="button-connect-wallet"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 sm:flex">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-sm" data-testid="text-wallet-address">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => disconnect()}
                data-testid="button-disconnect"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
