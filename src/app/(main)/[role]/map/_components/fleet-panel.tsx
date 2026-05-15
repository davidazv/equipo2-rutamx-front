"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getTripsByDay, getTravelTimes, type TripsByDayItem, type TravelTimeItem } from "@/lib/api/campaigns";
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

/** Layover time at each terminal (industry standard ~5 min each end). */
const TERMINAL_LAYOVER_MIN = 10;

/** Default headway when GTFS has no frequency data. */
const DEFAULT_HEADWAY_MIN = 10;

const QUALITY_CLASS: Record<TripsByDayItem["calidadDatos"], string> = {
  Alta:  "bg-success/10 text-success border-success/25",
  Media: "bg-warning/10 text-warning border-warning/25",
  Baja:  "bg-destructive/10 text-destructive border-destructive/25",
};

/** Returns the best estimate of one-way trip duration in minutes. */
function oneWayMinutes(t: TravelTimeItem): number {
  // Prefer scheduled time when it exists and looks reasonable;
  // fall back to estimatedTimeMinutes (distance ÷ 20 km/h).
  if (t.scheduledTimeMinutes > 0 && t.scheduledTimeMinutes <= t.estimatedTimeMinutes * 2) {
    return t.scheduledTimeMinutes;
  }
  return t.estimatedTimeMinutes > 0 ? t.estimatedTimeMinutes : 30;
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
  const [tripsByDay, setTripsByDay]     = useState<TripsByDayItem[]>([]);
  const [travelTimes, setTravelTimes]   = useState<TravelTimeItem[]>([]);
  const [busModels, setBusModels]       = useState<BusModel[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [occupancyTarget, setOccupancyTarget] = useState(80);
  const [committedOccupancy, setCommittedOccupancy] = useState(80);

  // User-overridable parameters — reset when route changes
  const [overrideHeadway,   setOverrideHeadway]   = useState<number | null>(null);
  const [overrideOneWay,    setOverrideOneWay]     = useState<number | null>(null);

  const routeShapesMap = useMemo(() => {
    const m = new Map<string, RouteWithShapes>();
    for (const r of routes) m.set(r.routeId, r);
    return m;
  }, [routes]);

  // ── Initial data fetch ───────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getTripsByDay(), getTravelTimes(), getBusModels()])
      .then(([tripsData, timesData, modelsData]) => {
        setTripsByDay(tripsData);
        setTravelTimes(timesData);
        setBusModels([...modelsData].sort((a, b) => b.passengerCapacity - a.passengerCapacity));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error cargando datos"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep selected route valid ────────────────────────────────────────────
  useEffect(() => {
    setSelectedRouteId((prev) => {
      if (routes.length === 0) return null;
      if (prev && routes.some((r) => r.routeId === prev)) return prev;
      return routes[0].routeId;
    });
  }, [routes]);

  // Reset overrides whenever the selected route changes
  useEffect(() => {
    setOverrideHeadway(null);
    setOverrideOneWay(null);
  }, [selectedRouteId]);

  // ── Notify parent on selection change ───────────────────────────────────
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

  // ── Derived values ───────────────────────────────────────────────────────

  const selectedTripData = useMemo(
    () => tripsByDay.find((d) => d.routeId === selectedRouteId) ?? null,
    [tripsByDay, selectedRouteId]
  );

  const routeTiming = useMemo(
    () => travelTimes.find((t) => t.routeId === selectedRouteId) ?? null,
    [travelTimes, selectedRouteId]
  );

  /**
   * Core fleet size formula (works for every route):
   *   cycleTime = 2 × oneWayTime + layover
   *   minBuses  = ceil(cycleTime / headway)
   *
   * This is the standard scheduling equation: to maintain a headway of F minutes
   * on a route whose buses take T minutes per round trip, you need ceil(T/F) buses.
   */
  const fleetCalc = useMemo(() => {
    if (!routeTiming) return null;
    const gtfsOneWay  = oneWayMinutes(routeTiming);
    const gtfsHeadway = routeTiming.frequencyMinutes > 0 ? routeTiming.frequencyMinutes : DEFAULT_HEADWAY_MIN;
    const oneWay  = overrideOneWay  ?? gtfsOneWay;
    const headway = overrideHeadway ?? gtfsHeadway;
    const cycle    = 2 * oneWay + TERMINAL_LAYOVER_MIN;
    const minBuses = Math.ceil(cycle / headway);
    return { oneWay, headway, cycle, minBuses, gtfsOneWay, gtfsHeadway };
  }, [routeTiming, overrideOneWay, overrideHeadway]);

  const AVG_PAX_PER_TRIP = 79;
  const PEAK_HOUR_FACTOR = 0.12;

  /** Estimated daily demand — real afluencia first, GTFS trip count × avg load as fallback. */
  const estimatedDailyDemand = useMemo(() => {
    if (!selectedTripData) return null;
    if (selectedTripData.demandaDiariaPromedio != null) return selectedTripData.demandaDiariaPromedio;
    return (selectedTripData.totalSemanal / 7) * AVG_PAX_PER_TRIP;
  }, [selectedTripData]);

  const peakHourDemand = useMemo(
    () => estimatedDailyDemand != null ? Math.round(estimatedDailyDemand * PEAK_HOUR_FACTOR) : 0,
    [estimatedDailyDemand]
  );

  /**
   * For each bus model, compute the fleet that actually satisfies BOTH constraints:
   *   1. Frequency constraint: enough buses to maintain the headway.
   *   2. Demand constraint:    enough capacity to absorb peak-hour passengers.
   *
   *   actualFleet(m) = max(cycleBuses, ceil(peakHour / (m.capacity × occ)))
   *   totalCost(m)   = actualFleet(m) × m.unitCost
   *
   * The model with the lowest totalCost is optimal — it naturally trades off
   * unit price vs. fleet size without needing arbitrary weights.
   * Only models whose autonomy covers the round trip are eligible.
   */
  const rankedModels = useMemo(() => {
    if (!routeTiming || !fleetCalc || busModels.length === 0) return [];
    const minAutonomy = routeTiming.distanceKm * 2;
    const cycleBuses  = fleetCalc.minBuses;
    const occ         = committedOccupancy / 100;

    const scored = busModels.map((m) => {
      const coversRoute = m.autonomyKm >= minAutonomy;
      if (!coversRoute) {
        return { model: m, coversRoute, actualFleet: null as number | null, totalCost: Infinity, recommended: false };
      }
      const demandFleet  = peakHourDemand > 0
        ? Math.ceil(peakHourDemand / (m.passengerCapacity * occ))
        : 0;
      const actualFleet  = Math.max(cycleBuses, demandFleet);
      const totalCost    = actualFleet * m.unitCostUsd;
      return { model: m, coversRoute, actualFleet, totalCost, recommended: false };
    });

    // Sort eligible by totalCost ASC, ineligible after sorted by autonomy DESC
    scored.sort((a, b) => {
      if (a.coversRoute !== b.coversRoute) return a.coversRoute ? -1 : 1;
      return a.totalCost - b.totalCost;
    });

    const bestId = scored.find((s) => s.coversRoute)?.model.id ?? null;
    return scored.map((s) => ({ ...s, recommended: s.model.id === bestId }));
  }, [routeTiming, fleetCalc, busModels, peakHourDemand, committedOccupancy]);

  /** Best model's fleet size — used in the fleet-size card. */
  const optimalEntry = useMemo(
    () => rankedModels.find((r) => r.recommended) ?? null,
    [rankedModels]
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getTripsByDay(), getTravelTimes(), getBusModels()])
      .then(([tripsData, timesData, modelsData]) => {
        setTripsByDay(tripsData);
        setTravelTimes(timesData);
        setBusModels([...modelsData].sort((a, b) => b.passengerCapacity - a.passengerCapacity));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <p className="text-base font-semibold">Optimización de Flota</p>
        <p className="text-xs text-text-muted mt-0.5">
          Flota mínima según ciclo de viaje y autonomía del modelo
        </p>
      </div>

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
                description="Tu sesión ha caducado. Cierra sesión e inicia de nuevo."
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
                action={<Button size="sm" onClick={retry}>Reintentar</Button>}
              />
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">

            {/* [1] Route selector */}
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Ruta</label>
              <Select value={selectedRouteId ?? ""} onValueChange={handleRouteChange}>
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

            {/* [1b] Parámetros operativos (editables, con valor GTFS como default) */}
            {fleetCalc && (
              <div className="rounded-lg border border-border p-3 space-y-3">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Parámetros operativos
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* One-way travel time */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted block">
                      Tiempo ida (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      placeholder={String(fleetCalc.gtfsOneWay)}
                      value={overrideOneWay ?? ""}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setOverrideOneWay(!isNaN(v) && v > 0 ? v : null);
                      }}
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-text-muted">
                      GTFS: {fleetCalc.gtfsOneWay} min
                    </p>
                  </div>
                  {/* Headway / frequency */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted block">
                      Frecuencia (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      placeholder={String(fleetCalc.gtfsHeadway)}
                      value={overrideHeadway ?? ""}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setOverrideHeadway(!isNaN(v) && v > 0 ? v : null);
                      }}
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-text-muted">
                      GTFS: {fleetCalc.gtfsHeadway} min
                    </p>
                  </div>
                </div>
                {(overrideOneWay != null || overrideHeadway != null) && (
                  <button
                    onClick={() => { setOverrideOneWay(null); setOverrideHeadway(null); }}
                    className="text-[10px] text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Restaurar valores GTFS
                  </button>
                )}
              </div>
            )}

            {/* [2] Solución óptima */}
            {optimalEntry && fleetCalc && (
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Solución óptima
                  </p>
                  <Badge className="text-[9px] px-1.5 shrink-0">Menor costo total</Badge>
                </div>

                {/* Main KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold tabular-nums leading-none">
                      {optimalEntry.actualFleet}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">buses en flota</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums leading-none">
                      ${((optimalEntry.totalCost) / 1_000_000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">inversión total USD</p>
                  </div>
                </div>

                {/* Model name */}
                <p className="text-xs font-medium text-foreground">
                  {optimalEntry.model.manufacturer} {optimalEntry.model.name}
                  <span className="text-text-muted font-normal ml-1">
                    ({optimalEntry.model.passengerCapacity} pas. · ${Math.round(optimalEntry.model.unitCostUsd / 1000)}k USD/unidad)
                  </span>
                </p>

                {/* Breakdown */}
                <div className="rounded-md bg-surface p-2.5 space-y-1 text-xs border border-border">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Ciclo de viaje (ida + vuelta + escala)</span>
                    <span className="font-medium tabular-nums">{fleetCalc.cycle} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Por frecuencia (cada {fleetCalc.headway} min)</span>
                    <span className="font-medium tabular-nums">{fleetCalc.minBuses} buses</span>
                  </div>
                  {peakHourDemand > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Por demanda hora pico ({peakHourDemand.toLocaleString("es-MX")} pas.)</span>
                      <span className="font-medium tabular-nums">
                        {Math.ceil(peakHourDemand / (optimalEntry.model.passengerCapacity * (committedOccupancy / 100)))} buses
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold">
                    <span className="text-text-muted">Flota necesaria (el mayor)</span>
                    <span className="tabular-nums">{optimalEntry.actualFleet} buses</span>
                  </div>
                </div>

                {/* Occupancy slider */}
                <div className="pt-0.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-text-muted">Ocupación objetivo</span>
                    <span className="text-xs font-medium">{occupancyTarget}%</span>
                  </div>
                  <Slider
                    value={[occupancyTarget]}
                    onValueChange={(v) => setOccupancyTarget(v[0])}
                    onValueCommit={(v) => setCommittedOccupancy(v[0])}
                    min={60}
                    max={95}
                    step={5}
                  />
                </div>
              </div>
            )}

            {/* [3] Comparación de modelos */}
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Comparativa de modelos
              </p>
              {routeTiming && (
                <p className="text-xs text-text-muted mb-3">
                  Autonomía mín: <span className="font-medium">{Math.ceil(routeTiming.distanceKm * 2)} km</span>
                  {peakHourDemand > 0 && (
                    <> · Hora pico: <span className="font-medium">{peakHourDemand.toLocaleString("es-MX")} pas.</span></>
                  )}
                </p>
              )}

              <div className="space-y-1.5">
                {rankedModels.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">Sin modelos disponibles</p>
                ) : (
                  rankedModels.map(({ model, coversRoute, actualFleet, totalCost, recommended }) => (
                    <div
                      key={model.id}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        recommended ? "border-primary bg-primary/5" : "border-border opacity-70"
                      )}
                    >
                      {/* Row 1: name + total cost */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium truncate text-xs leading-tight">
                          {model.manufacturer} {model.name}
                        </p>
                        <div className="text-right shrink-0">
                          {coversRoute && actualFleet != null ? (
                            <p className="text-xs font-semibold tabular-nums">
                              ${(totalCost / 1_000_000).toFixed(2)}M USD
                            </p>
                          ) : (
                            <p className="text-xs text-destructive">No apto</p>
                          )}
                        </div>
                      </div>
                      {/* Row 2: specs + fleet count */}
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-text-muted">
                          {model.passengerCapacity} pas · {model.autonomyKm} km · ${Math.round(model.unitCostUsd / 1000)}k/u
                          {!coversRoute && <span className="text-destructive ml-1">· Autonomía insuf.</span>}
                        </p>
                        {coversRoute && actualFleet != null && (
                          <p className="text-[10px] text-text-muted shrink-0 ml-2">
                            {actualFleet} buses
                          </p>
                        )}
                      </div>
                      {recommended && (
                        <Badge className="mt-1 text-[9px] px-1.5 py-0">Óptimo</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
