import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Users, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function StatsBar() {
  const stats = [
    {
      icon: Users,
      label: "Active Users",
      value: "1,247",
      change: "+12%",
    },
    {
      icon: TrendingUp,
      label: "Total Staked",
      value: "234.5K ETK",
      change: "+8%",
    },
    {
      icon: Zap,
      label: "Energy Traded",
      value: "1.2M kWh",
      change: "+23%",
    },
  ];

  return (
    <div className="space-y-4">
      <Alert className="border-primary/50 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2 text-sm">
          <span className="font-medium">Demo Statistics</span> — The metrics below are mockup data for demonstration purposes
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-primary">{stat.change}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-mono" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
