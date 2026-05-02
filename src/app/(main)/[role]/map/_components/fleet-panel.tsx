"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getTripsByDay, type TripsByDayItem } from "@/lib/api/campaigns";
import { getBusModels, type BusModel } from "@/lib/api/bus-models";
import type { RouteWithShapes } from "@/lib/api/energy";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Period = "entre-semana" | "fin-de-semana" | "toda-la-semana";

const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "entre-semana",    label: "Entre Semana (L–V)" },
  { value: "fin-de-semana",   label: "Fin de Semana (S–D)" },
  { value: "toda-la-semana",  label: "Toda la semana" },
];

const QUALITY_CLASS: Record<TripsByDayItem["calidadDatos"], string> = {
  Alta:  "bg-success/10 text-success border-success/25",
  Media: "bg-warning/10 text-warning border-warning/25",
  Baja:  "bg-destructive/10 text-destructive border-destructive/25",
};

function computeAvgDemand(item: TripsByDayItem, _period: Period): number | null {
  // Per-day passenger breakdown is unavailable; use the backend-computed overall average.
  // Returns null when no afluencia data has been imported.
  return item.demandaDiariaPromedio ?? null;
}

function computeBounds(
  coords: [number, number][]
): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [[minLng, minLat], [maxLng, maxLat]];
}

interface FleetPanelProps {
  routes: RouteWithShapes[];
  onSelectionChange: (
    routeId: string,
    bounds: [[number, number], [number, number]] | null,
    colorMap: Map<string, string>
  ) => void;
}

export function FleetPanel({ routes, onSelectionChange }: FleetPanelProps) {
  const [tripsByDay, setTripsByDay] = useState<TripsByDayItem[]>([]);
  const [busModels, setBusModels] = useState<BusModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("entre-semana");
  const [occupancyTarget, setOccupancyTarget] = useState(80);

  const routeShapesMap = useMemo(() => {
    const m = new Map<string, RouteWithShapes>();
    for (const r of routes) m.set(r.routeId, r);
    return m;
  }, [routes]);

  // Initial data fetch (routes come from the parent via prop, not from API)
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getTripsByDay(), getBusModels()])
      .then(([tripsData, modelsData]) => {
        setTripsByDay(tripsData);
        setBusModels(
          [...modelsData].sort((a, b) => b.passengerCapacity - a.passengerCapacity)
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando datos")
      )
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep selected route valid when the filtered routes list changes
  useEffect(() => {
    setSelectedRouteId((prev) => {
      if (routes.length === 0) return null;
      if (prev && routes.some((r) => r.routeId === prev)) return prev;
      return routes[0].routeId;
    });
  }, [routes]);

  // Notify parent on selection or data change
  useEffect(() => {
    if (!selectedRouteId || tripsByDay.length === 0) return;
    const shape = routeShapesMap.get(selectedRouteId);
    const bounds = shape ? computeBounds(shape.coordinates) : null;
    const colorMap = new Map(tripsByDay.map((d) => [d.routeId, d.agencyColor]));
    onSelectionChange(selectedRouteId, bounds, colorMap);
  }, [selectedRouteId, tripsByDay, routeShapesMap, onSelectionChange]);

  const handleRouteChange = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
  }, []);

  const selectedTripData = useMemo(
    () => tripsByDay.find((d) => d.routeId === selectedRouteId) ?? null,
    [tripsByDay, selectedRouteId]
  );

  const avgDemand = useMemo(() => {
    if (!selectedTripData) return null;
    return computeAvgDemand(selectedTripData, period);
  }, [selectedTripData, period]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getTripsByDay(), getBusModels()])
      .then(([tripsData, modelsData]) => {
        setTripsByDay(tripsData);
        setBusModels(
          [...modelsData].sort((a, b) => b.passengerCapacity - a.passengerCapacity)
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* [1] Header */}
      <div className="p-4 border-b border-border shrink-0">
        <p className="text-base font-semibold">Optimización de Flota</p>
        <p className="text-xs text-text-muted mt-0.5">
          Recomendaciones basadas en afluencia histórica 2005–2026
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner size="lg" />
            <p className="text-sm text-text-muted">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="p-4">
            {error.includes("401") ? (
              <ErrorState
                title="Sesión expirada"
                description="Tu sesión ha caducado. Cierra sesión e inicia de nuevo para continuar."
                action={
                  <Button size="sm" onClick={() => { window.location.href = "/login"; }}>
                    Iniciar sesión
                  </Button>
                }
              />
            ) : (
              <ErrorState
                title="Error cargando datos"
                description={error}
                action={
                  <Button size="sm" onClick={retry}>
                    Reintentar
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* [2] Route selector */}
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Ruta</label>
              <Select
                value={selectedRouteId ?? ""}
                onValueChange={handleRouteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ruta" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.routeId} value={r.routeId}>
                      Línea {r.routeShortName} – {r.routeLongName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* [3] Period selector */}
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Período</label>
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as Period)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* [4] Demanda diaria promedio — HU21 */}
            {selectedTripData === null && tripsByDay.length > 0 ? (
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-xs text-text-muted">
                  Sin datos de viajes programados para esta ruta
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Demanda diaria promedio
                  </p>
                  {selectedTripData && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border shrink-0",
                        QUALITY_CLASS[selectedTripData.calidadDatos]
                      )}
                    >
                      {selectedTripData.calidadDatos}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {avgDemand !== null
                    ? `${Math.round(avgDemand).toLocaleString("es-MX")} pasajeros/día`
                    : "—"}
                </p>
              </div>
            )}

            {/* [5] Buses recomendados — HU11 placeholder */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Buses recomendados
              </p>
              <p className="text-2xl font-bold text-text-muted">—</p>
              <p className="text-xs text-text-muted">Disponible próximamente</p>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-text-muted">
                    Ocupación objetivo
                  </label>
                  <span className="text-xs font-medium">{occupancyTarget}%</span>
                </div>
                <Slider
                  value={[occupancyTarget]}
                  onValueChange={(v) => setOccupancyTarget(v[0])}
                  min={60}
                  max={95}
                  step={5}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Pasajeros/hora pico</span>
                <span className="font-medium text-text-muted">—</span>
              </div>
            </div>

            {/* [6] Modelo recomendado — HU12 placeholder */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Modelo recomendado
              </p>
              <div className="space-y-1.5">
                {busModels.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {m.manufacturer} {m.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {m.passengerCapacity} pas · {m.autonomyKm} km
                      </p>
                    </div>
                    <span className="text-xs text-text-muted shrink-0 ml-3 tabular-nums">
                      ${Math.round(m.unitCostUsd / 1000)}k USD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
