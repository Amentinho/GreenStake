import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { AlertTriangle } from "lucide-react";

/**
 * NetworkSwitcher Component
 * 
 * Displays an alert when user is connected to wrong network
 * Provides one-click network switching to Sepolia
 */
export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  // Don't show if not connected or already on Sepolia
  if (!isConnected || chain?.id === sepolia.id) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6" data-testid="alert-wrong-network">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Wrong Network Detected</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          GreenStake DEX operates on <strong>Ethereum Sepolia</strong> testnet. 
          Please switch networks to continue.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => switchChain({ chainId: sepolia.id })}
          disabled={isPending}
          data-testid="button-switch-network"
          className="shrink-0"
        >
          {isPending ? "Switching..." : "Switch to Sepolia"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
