"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getRoutesWithShapes,
  type RouteWithShapes,
} from "@/lib/api/energy";
import { getAgencies, type AgencyResponse } from "@/lib/api/agencies";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { getAgencyFallback } from "@/constants/agency-colors";
import { MapContainer } from "./_components/map-container";
import { RouteList } from "./_components/route-list";
import { EnergyConsumptionCalculator } from "./_components/energy-consumption-calculator";

function resolveColor(route: RouteWithShapes, _index: number): string {
  if (route.routeColor) return `#${route.routeColor}`;
  return getAgencyFallback(route.agencyId);
}

export default function MapPage() {
  const [routes, setRoutes] = useState<RouteWithShapes[]>([]);
  const [agencies, setAgencies] = useState<AgencyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRoutesWithShapes(), getAgencies()])
      .then(([routesData, agenciesData]) => {
        setRoutes(routesData);
        setAgencies(agenciesData);
        const rtpAgency = agenciesData.find((a) =>
          a.agencyName.toLowerCase().includes("transporte de pasajeros")
        );
        setSelectedAgencyId(
          rtpAgency?.agencyId ?? agenciesData[0]?.agencyId ?? null
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando rutas")
      )
      .finally(() => setLoading(false));
  }, []);

  const agencyRoutes = useMemo(
    () =>
      selectedAgencyId
        ? routes.filter((r) => r.agencyId === selectedAgencyId)
        : routes,
    [routes, selectedAgencyId]
  );

  const visibleAgencyIds = useMemo(
    () => [...new Set(agencyRoutes.map((r) => r.agencyId))],
    [agencyRoutes]
  );

  const handleAgencyChange = useCallback((agencyId: string) => {
    setSelectedAgencyId(agencyId);
    setSelectedRouteId(null);
  }, []);

  const handleRouteSelect = useCallback((routeId: string | null) => {
    setSelectedRouteId(routeId);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[calc(100vh-8rem)]">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando rutas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <ErrorState
          title="Error cargando rutas"
          description={error}
          action={
            <Button size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-3">
      <div className="flex flex-1 gap-4 min-h-0">
        <div className="w-[380px] flex-shrink-0 flex flex-col bg-background rounded-lg border border-border overflow-hidden min-h-0">
          <RouteList
            routes={agencyRoutes}
            selectedRouteId={selectedRouteId}
            onRouteSelect={handleRouteSelect}
            getRouteColor={resolveColor}
            agencies={agencies}
            selectedAgencyId={selectedAgencyId}
            onAgencyChange={handleAgencyChange}
          />
          <EnergyConsumptionCalculator
            routes={agencyRoutes}
            selectedRouteId={selectedRouteId}
            onRouteChange={handleRouteSelect}
          />
        </div>

        <div className="flex-1 rounded-lg overflow-hidden border border-border min-h-0">
          <MapContainer
            routes={agencyRoutes}
            selectedRouteId={selectedRouteId}
            getRouteColor={resolveColor}
            visibleAgencyIds={visibleAgencyIds}
          />
        </div>
      </div>
    </div>
  );
}
