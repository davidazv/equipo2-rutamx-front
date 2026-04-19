"use client";

import { useState, useEffect } from "react";
import { Fuel, Leaf, TrendingUp } from "lucide-react";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { getKpiMetrics, type KpiMetricsResponse } from "@/lib/api/roi";

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M MXN`;
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function formatNumber(value: number) {
  return value.toLocaleString("es-MX");
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KpiMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getKpiMetrics()
      .then(setKpi)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando KPI")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Vision general del sistema de transporte electrico
        </p>
      </div>

      {/* ROI Card — full width */}
      <ROIComparisonCard />

      {/* KPI Cards */}
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {error && !loading && (
        <ErrorState
          title="Error cargando métricas"
          description={error}
          action={
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Reintentar
            </button>
          }
        />
      )}

      {kpi && !loading && !error && (
        <div className="grid gap-3 md:grid-cols-2">
          {/* Ahorro Combustible */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ahorro Combustible
                  </p>
                  <p className="text-3xl font-bold tracking-tight tabular-nums">
                    {formatCurrency(kpi.totalFuelSavingsMXN)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ahorro anual vs diesel ({kpi.routesAnalyzed} rutas)
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Fuel className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CO2 Reducido */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">CO2 Reducido</p>
                  <p className="text-3xl font-bold tracking-tight tabular-nums text-green-600">
                    {formatNumber(Math.round(kpi.totalCo2AvoidedTons))} ton
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CO2 evitado por ano ({kpi.routesAnalyzed} rutas)
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Leaf className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
