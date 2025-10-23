import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, Network, TrendingUp } from "lucide-react";

export function Hero() {
  const scrollToDashboard = () => {
    const dashboard = document.getElementById('dashboard');
    dashboard?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden border-b">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 backdrop-blur">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">Live on Sepolia • PYUSD Settlement</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Sustainable Energy Trading
            <span className="text-primary"> on Ethereum</span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Trade renewable energy on Ethereum testnet with AI demo predictions, real-time Pyth oracle pricing, 
            and PYUSD stablecoin settlements. V3 contract deployed on Sepolia.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="gap-2 text-base"
              onClick={scrollToDashboard}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-base backdrop-blur"
              asChild
              data-testid="button-learn-more"
            >
              <a href="https://github.com/Amentinho/GreenStake/blob/main/README.md" target="_blank" rel="noopener noreferrer">
                Learn More
              </a>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-6 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI Integration</h3>
              <p className="text-center text-sm text-muted-foreground">
                GPT-2 text generation demo for energy predictions
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-6 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Pyth Oracle</h3>
              <p className="text-center text-sm text-muted-foreground">
                Real-time ETH/USD pricing for settlements
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/30 p-6 backdrop-blur opacity-70">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Network className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-muted-foreground">Cross-Chain</h3>
              <p className="text-center text-sm text-muted-foreground">
                Avail Nexus bridging (coming soon)
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-6 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">PYUSD Settled</h3>
              <p className="text-center text-sm text-muted-foreground">
                Testnet stablecoin settlement on Sepolia
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
