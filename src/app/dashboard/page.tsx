"use client";

import { useState, useEffect } from "react";
import { Fuel, Leaf } from "lucide-react";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";
import { FuelSavingsCard } from "@/components/shared/fuel-savings-card";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
  getKpiMetrics,
  getBusModels,
  getRoutes,
  type KpiMetricsResponse,
  type BusModelResponse,
  type RouteResponse,
} from "@/lib/api/roi";

function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function formatNumber(value: number) {
  return value.toLocaleString("es-MX");
}

interface DashboardData {
  kpi: KpiMetricsResponse;
  busModels: BusModelResponse[];
  routes: RouteResponse[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getKpiMetrics(), getBusModels(), getRoutes()])
      .then(([kpi, busModels, routes]) =>
        setData({ kpi, busModels, routes })
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando datos")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error cargando dashboard"
        description={error}
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (!data) return null;

  const electricModels = data.busModels.filter(
    (m) => m.fuelType === "ELECTRIC"
  );

  return (
    <div className="space-y-4" data-testid="roi-dashboard">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Vision general del sistema de transporte electrico
        </p>
      </div>

      <ROIComparisonCard
        busModels={electricModels}
        routes={data.routes}
      />

      <FuelSavingsCard
        busModels={data.busModels}
        routes={data.routes}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ahorro Combustible
                </p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {formatCurrency(data.kpi.totalFuelSavingsMXN)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ahorro anual vs diesel ({data.kpi.routesAnalyzed} rutas)
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fuel className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  CO2 Reducido
                </p>
                <p className="text-3xl font-bold tracking-tight tabular-nums text-green-600">
                  {formatNumber(Math.round(data.kpi.totalCo2AvoidedTons))} ton
                </p>
                <p className="text-xs text-muted-foreground">
                  CO2 evitado por ano ({data.kpi.routesAnalyzed} rutas)
                </p>
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
