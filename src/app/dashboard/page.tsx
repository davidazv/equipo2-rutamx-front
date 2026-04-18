"use client";

import { Fuel, Leaf, TrendingUp } from "lucide-react";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";
import { Card, CardContent } from "@/components/ui/card";

const MOCK_KPI = {
  fuelSavingsMXN: 4_200_000,
  fuelSavingsTrend: 8.3,
  co2ReductionTons: 12480,
  co2ReductionTrend: 14.2,
};

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M MXN`;
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function formatNumber(value: number) {
  return value.toLocaleString("es-MX");
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Visión general del sistema de transporte eléctrico
        </p>
      </div>

      {/* ROI Card — full width */}
      <ROIComparisonCard />

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Ahorro Combustible */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ahorro Combustible</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {formatCurrency(MOCK_KPI.fuelSavingsMXN)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="tabular-nums">+{MOCK_KPI.fuelSavingsTrend.toFixed(1)}%</span>
                  <span className="text-muted-foreground ml-1">vs mes ant.</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fuel className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CO₂ Reducido */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">CO₂ Reducido</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums text-green-600">
                  {formatNumber(MOCK_KPI.co2ReductionTons)} ton
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="tabular-nums">+{MOCK_KPI.co2ReductionTrend.toFixed(1)}%</span>
                  <span className="text-muted-foreground ml-1">vs año ant.</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Leaf className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
