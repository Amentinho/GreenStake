import { useState } from "react";
import { useAccount } from "wagmi";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { ForecastCard } from "@/components/ForecastCard";
import { StakeCard } from "@/components/StakeCard";
import { TradeCard } from "@/components/TradeCard";
import { ExplorerEmbed } from "@/components/ExplorerEmbed";
import { ActivityHistory } from "@/components/ActivityHistory";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [forecastValue, setForecastValue] = useState<number | null>(null);
  const [stakeCompleted, setStakeCompleted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      
      <main className="flex-1">
        {/* Stats Bar */}
        <section className="border-b bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <StatsBar />
          </div>
        </section>

        {/* Dashboard */}
        <section id="dashboard" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Trade Dashboard</h2>
              <p className="text-muted-foreground">
                Connect your wallet to start trading sustainable energy
              </p>
            </div>

            {!isConnected ? (
              <div className="max-w-2xl mx-auto">
                <Alert className="border-primary/50">
                  <Wallet className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Please connect your wallet using the button in the header to access the trading dashboard.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main trading interface */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left column */}
                  <div className="space-y-6">
                    <ForecastCard
                      walletAddress={address!}
                      onForecastComplete={setForecastValue}
                    />
                    <StakeCard
                      walletAddress={address!}
                      forecastValue={forecastValue}
                      onStakeComplete={() => setStakeCompleted(true)}
                    />
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <TradeCard
                      walletAddress={address!}
                      stakeCompleted={stakeCompleted}
                    />
                    <ActivityHistory walletAddress={address!} />
                  </div>
                </div>

                {/* Explorer embed - full width */}
                <ExplorerEmbed />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
