"use client";

import { useState, useEffect, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { CostComparisonCard } from "@/components/dashboard/cost-comparison-card";
import { PaybackChart } from "@/components/dashboard/payback-chart";
import {
  getBusModels,
  getRoutes,
  estimateRoi,
  type BusModelResponse,
  type RouteResponse,
  type RoiEstimateResponse,
} from "@/lib/api/roi";

interface RouteEstimate {
  route: RouteResponse;
  estimate: RoiEstimateResponse;
}

export default function DashboardPage() {
  const [busModels, setBusModels] = useState<BusModelResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [buses, setBuses] = useState(10);

  const [routeEstimates, setRouteEstimates] = useState<RouteEstimate[]>([]);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    Promise.all([getBusModels(), getRoutes()])
      .then(([models, rts]) => {
        const electric = models.filter((m) => m.fuelType === "ELECTRIC");
        setBusModels(electric);
        setRoutes(rts);
        if (rts.length > 0) setSelectedRoutes([rts[0].routeId]);
        if (electric.length > 0) setSelectedModel(electric[0].id);
      })
      .catch((err) =>
        setInitError(err instanceof Error ? err.message : "Error cargando datos")
      )
      .finally(() => setInitLoading(false));
  }, []);

  // Fetch ROI estimates when filters change
  const fetchEstimates = useCallback(async () => {
    if (selectedRoutes.length === 0 || selectedModel === null) return;

    setEstimating(true);
    setEstimateError(null);

    try {
      const routeMap = new Map(routes.map((r) => [r.routeId, r]));
      const results = await Promise.all(
        selectedRoutes.map(async (routeId) => {
          const est = await estimateRoi(routeId, selectedModel, buses);
          return { route: routeMap.get(routeId)!, estimate: est };
        })
      );
      setRouteEstimates(results);
    } catch (err) {
      setEstimateError(
        err instanceof Error ? err.message : "Error estimando ROI"
      );
      setRouteEstimates([]);
    } finally {
      setEstimating(false);
    }
  }, [selectedRoutes, selectedModel, buses, routes]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <ErrorState
        title="Error cargando dashboard"
        description={initError}
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  // First selected route's estimate for KPI cards
  const primaryEstimate = routeEstimates[0]?.estimate ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Vision general del sistema de transporte electrico
        </p>
      </div>

      <FilterBar
        routes={routes}
        busModels={busModels}
        selectedRoutes={selectedRoutes}
        selectedModel={selectedModel}
        buses={buses}
        onRoutesChange={setSelectedRoutes}
        onModelChange={setSelectedModel}
        onBusesChange={setBuses}
      />

      {estimateError && (
        <p className="text-xs text-destructive">{estimateError}</p>
      )}

      {estimating ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <>
          <KpiCards estimate={primaryEstimate} />

          <div className="grid gap-3 lg:grid-cols-2">
            <CostComparisonCard estimate={primaryEstimate} />
            <div />
          </div>

          <PaybackChart routeEstimates={routeEstimates} />
        </>
      )}
    </div>
  );
}
