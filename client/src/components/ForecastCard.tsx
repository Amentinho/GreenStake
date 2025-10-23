import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ForecastCardProps {
  walletAddress: string;
  onForecastComplete: (forecast: number) => void;
}

export function ForecastCard({ walletAddress, onForecastComplete }: ForecastCardProps) {
  const [forecast, setForecast] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleForecast = async () => {
    setIsLoading(true);
    try {
      const result = await api.createForecast({ walletAddress });
      setForecast(result.predictedConsumption);
      onForecastComplete(result.predictedConsumption);
      toast({
        title: "Forecast Complete",
        description: `AI predicted ${result.predictedConsumption} kWh consumption`,
      });
    } catch (error) {
      toast({
        title: "Forecast Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>AI Energy Forecast</CardTitle>
              <CardDescription>Predict your consumption needs</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {forecast !== null ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card/50 p-6 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold font-mono text-primary" data-testid="text-forecast-value">
                  {forecast.toLocaleString()}
                </span>
                <span className="text-2xl font-medium text-muted-foreground">kWh</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Predicted monthly consumption
              </p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  AI Model: Hugging Face GPT-2
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Trained on historical consumption: 1000, 1200, 1100, 1350, 1250 kWh (last 5 months). 
                Predicts next month's energy needs using pattern recognition. Fallback: 1300 kWh if API unavailable.
              </p>
            </div>

            <Button
              onClick={handleForecast}
              variant="outline"
              className="w-full"
              disabled={isLoading}
              data-testid="button-reforecast"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Re-Forecast
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-3">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Predict next month's energy consumption using Hugging Face AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Analyzes historical patterns: 1000, 1200, 1100, 1350, 1250 kWh (last 5 months)
                </p>
              </div>
            </div>

            <Button
              onClick={handleForecast}
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-forecast"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate AI Forecast
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
