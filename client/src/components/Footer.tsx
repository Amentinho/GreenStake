import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">GreenStake</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sustainable energy trading powered by blockchain technology.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://docs.avail.so/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Technologies</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Avail Nexus</li>
              <li className="text-muted-foreground">Semaphore ZKP</li>
              <li className="text-muted-foreground">Hugging Face AI</li>
              <li className="text-muted-foreground">PYUSD Stablecoin</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Bounties</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Avail Nexus ($9.5K)</li>
              <li className="text-muted-foreground">PYUSD ($10K)</li>
              <li className="text-muted-foreground">Autoscout ($3.5K)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 GreenStake. Built for a sustainable future.
            </p>
            <p className="text-xs text-muted-foreground">
              ⚠️ Testnet Only - Not for production use
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
