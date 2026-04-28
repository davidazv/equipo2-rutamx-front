"use client";

import { useEffect, useState } from "react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";
import { FuelSavingsCard } from "@/components/shared/fuel-savings-card";
import {
  getBusModels,
  getRoutes,
  type BusModelResponse,
  type RouteResponse,
} from "@/lib/api/roi";

export default function DashboardPage() {
  const role = useCurrentRole();
  const [busModels, setBusModels] = useState<BusModelResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [models, rts] = await Promise.all([getBusModels(), getRoutes()]);
        setBusModels(models);
        setRoutes(rts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const showCeoCards = role === "ceo" || role === "admin";

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Vision general del sistema de transporte electrico
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Vision general del sistema de transporte electrico
          </p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          Vision general del sistema de transporte electrico
        </p>
      </div>

      {showCeoCards && busModels.length > 0 && routes.length > 0 && (
        <>
          <ROIComparisonCard busModels={busModels} routes={routes} />
          <FuelSavingsCard busModels={busModels} routes={routes} />
        </>
      )}
    </div>
  );
}
