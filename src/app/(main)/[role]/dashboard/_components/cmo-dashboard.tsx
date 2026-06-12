"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Leaf, Timer, MapPin } from "lucide-react";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { BarChart } from "@/components/charts/bar-chart";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { getRouteStats, type RouteStatsResponse } from "@/lib/api/cmo";
import { getAgenciesWithColors, type AgencyWithColorsResponse } from "@/lib/api/agencies";
import { formatNumber } from "@/lib/utils";

const MAX_CHART_ROUTES = 20;

export function CmoDashboard() {
  const [routes, setRoutes] = useState<RouteStatsResponse[]>([]);
  const [agencies, setAgencies] = useState<AgencyWithColorsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<string>("");

  useEffect(() => {
    Promise.all([getRouteStats(), getAgenciesWithColors()])
      .then(([r, a]) => {
        setRoutes(r);
        setAgencies(a);
        if (a.length > 0) setSelectedAgency(a[0].agencyId);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const agencyMap = useMemo(
    () => new Map<string, AgencyWithColorsResponse>(agencies.map((a) => [a.agencyId, a])),
    [agencies]
  );

  const filtered = useMemo(
    () => routes.filter((r) => r.agencyId === selectedAgency),
    [routes, selectedAgency]
  );

  const passengerChartRoutes = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.avgDailyPassengers - a.avgDailyPassengers)
        .slice(0, MAX_CHART_ROUTES),
    [filtered]
  );

  const co2ChartRoutes = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.co2AhorradoTonAnio - a.co2AhorradoTonAnio)
        .slice(0, MAX_CHART_ROUTES),
    [filtered]
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || routes.length === 0) {
    return (
      <ErrorState
        title="Error cargando análisis de rutas"
        description={error ?? "No hay datos de rutas disponibles"}
      />
    );
  }

  const passengersData = {
    labels: passengerChartRoutes.map((r) => r.routeName),
    datasets: [
      {
        label: "Pasajeros promedio / día",
        data: passengerChartRoutes.map((r) => r.avgDailyPassengers),
        backgroundColor: passengerChartRoutes.map((r) =>
          r.agencyColor ? `#${r.agencyColor}` : "#3B82F6"
        ),
        borderWidth: 0,
      },
    ],
  };

  const co2Data = {
    labels: co2ChartRoutes.map((r) => r.routeName),
    datasets: [
      {
        label: "Diésel (ton CO₂/año)",
        data: co2ChartRoutes.map((r) => r.co2DieselTonAnio),
        backgroundColor: "#F97316",
        borderWidth: 0,
      },
      {
        label: "Eléctrico (ton CO₂/año)",
        data: co2ChartRoutes.map((r) => r.co2ElectricoTonAnio),
        backgroundColor: "#22C55E",
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-4" data-testid="co2-savings-chart">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Rutas</h1>
        <p className="text-sm text-text-secondary">
          Pasajeros, emisiones CO₂ y frecuencias por ruta
        </p>
      </div>

      {/* Filtro por medio de transporte */}
      <div className="flex flex-wrap gap-2">
        {agencies.map((a) => (
          <button
            key={a.agencyId}
            onClick={() => setSelectedAgency(a.agencyId)}
            style={
              selectedAgency === a.agencyId && a.agencyColor
                ? { backgroundColor: `#${a.agencyColor}` }
                : undefined
            }
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedAgency === a.agencyId
                ? `text-white${a.agencyColor ? "" : " bg-primary"}`
                : "bg-muted text-text-secondary hover:bg-muted/80"
            }`}
          >
            {a.agencyName}
          </button>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartWrapper
          title="Pasajeros Diarios por Ruta"
          description={
            filtered.length > MAX_CHART_ROUTES
              ? `Top ${MAX_CHART_ROUTES} rutas por afluencia`
              : "Afluencia promedio diaria por ruta"
          }
        >
          <BarChart data={passengersData} horizontal />
        </ChartWrapper>

        <ChartWrapper
          title="CO₂ Evitado por Ruta vs Diésel"
          description="Emisiones anuales estimadas: eléctrico vs equivalente diésel (ton CO₂/año)"
        >
          <BarChart data={co2Data} />
        </ChartWrapper>
      </div>

      {/* Tablero por ruta */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Tablero por Ruta</h2>
          <span className="text-sm text-text-secondary">
            {filtered.length} ruta{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((route) => {
            const agency = agencyMap.get(route.agencyId);
            const color = route.agencyColor ? `#${route.agencyColor}` : "#3B82F6";

            return (
              <Card key={route.routeId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight truncate">
                        {route.routeName}
                      </p>
                      {agency && (
                        <p className="text-xs text-text-secondary truncate">
                          {agency.agencyName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="flex items-start gap-1.5">
                      <Users className="mt-px h-3 w-3 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-text-muted">Pasajeros/día</p>
                        <p className="font-semibold">
                          {formatNumber(route.avgDailyPassengers)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Leaf className="mt-px h-3 w-3 shrink-0 text-green-600" />
                      <div>
                        <p className="text-text-muted">CO₂ ahorrado/año</p>
                        <p className="font-semibold text-green-600">
                          {route.co2AhorradoTonAnio} ton
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-px h-3 w-3 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-text-muted">Distancia</p>
                        <p className="font-semibold">{route.distanciaKm} km</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Timer className="mt-px h-3 w-3 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-text-muted">Frecuencia</p>
                        <p className="font-semibold">
                          {route.headwayMinutes > 0
                            ? `${route.headwayMinutes} min`
                            : "N/D"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
