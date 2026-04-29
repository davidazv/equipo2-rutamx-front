import { Card, CardContent } from "@/components/ui/card";
import type { RoiEstimateResponse } from "@/lib/api/roi";

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(v).toLocaleString("es-MX")}`;
}

interface CostComparisonCardProps {
  estimate: RoiEstimateResponse | null;
}

export function CostComparisonCard({ estimate }: CostComparisonCardProps) {
  if (!estimate) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Costo Operativo Anual</p>
          <p className="text-sm text-muted-foreground mt-4">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const maxCost = Math.max(estimate.electricCostPerYear, estimate.dieselCostPerYear);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Costo Operativo Anual
        </p>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Electrico</span>
              <span className="text-primary font-medium tabular-nums">
                {fmt(estimate.electricCostPerYear)} MXN
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60 transition-all duration-300"
                style={{
                  width: `${(estimate.electricCostPerYear / maxCost) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Diesel equiv.</span>
              <span className="text-destructive font-medium tabular-nums">
                {fmt(estimate.dieselCostPerYear)} MXN
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-destructive/60 transition-all duration-300"
                style={{
                  width: `${(estimate.dieselCostPerYear / maxCost) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/30">
          <span className="text-xs text-muted-foreground font-medium">
            Ahorro anual
          </span>
          <span className="text-sm font-bold text-green-600 tabular-nums">
            {fmt(estimate.netAnnualReturn)} MXN
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
