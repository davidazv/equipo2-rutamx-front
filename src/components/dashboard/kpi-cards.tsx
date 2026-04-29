import { TrendingUp, Clock, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RoiEstimateResponse } from "@/lib/api/roi";

interface KpiCardsProps {
  estimate: RoiEstimateResponse | null;
}

const cards = [
  {
    label: "ROI Ano 1",
    icon: TrendingUp,
    format: (est: RoiEstimateResponse) => `${est.roiPercent.toFixed(1)}%`,
    color: "text-primary",
  },
  {
    label: "Recuperacion",
    icon: Clock,
    format: (est: RoiEstimateResponse) => `${est.paybackYears.toFixed(1)} anos`,
    color: "text-foreground",
  },
  {
    label: "CO2 Evitado/Ano",
    icon: Leaf,
    format: (est: RoiEstimateResponse) =>
      `${Math.round(est.co2AvoidedTons).toLocaleString("es-MX")} ton`,
    color: "text-green-600",
  },
] as const;

export function KpiCards({ estimate }: KpiCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
      {cards.map(({ label, icon: Icon, format, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold tracking-tight tabular-nums ${color}`}>
                  {estimate ? format(estimate) : "—"}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
