import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Leaf, Users } from "lucide-react";

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
    {
      icon: Leaf,
      label: "CO₂ Offset",
      value: "450 tons",
      change: "+15%",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}
