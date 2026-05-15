"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCo2Savings, type Co2SavingsItem } from "@/lib/api/campaigns";
import { getBusModels, type BusModel } from "@/lib/api/bus-models";
import type { RouteWithShapes } from "@/lib/api/energy";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DayKey = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";

const DAY_LABELS: Array<{ key: DayKey; short: string; name: string }> = [
  { key: "lunes",     short: "L", name: "Lunes" },
  { key: "martes",    short: "M", name: "Martes" },
  { key: "miercoles", short: "X", name: "Miércoles" },
  { key: "jueves",    short: "J", name: "Jueves" },
  { key: "viernes",   short: "V", name: "Viernes" },
  { key: "sabado",    short: "S", name: "Sábado" },
  { key: "domingo",   short: "D", name: "Domingo" },
];

const PRIORITY_CLASS: Record<Co2SavingsItem["prioridad"], string> = {
  Alta:  "bg-primary text-white border-transparent",
  Media: "bg-warning/10 text-warning border-warning/25",
  Baja:  "bg-muted text-text-muted border-muted/50",
};

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

interface CampaignsPanelProps {
  routes: RouteWithShapes[];
  onSelectionChange: (
    routeId: string,
    bounds: [[number, number], [number, number]] | null,
    colorMap: Map<string, string>
  ) => void;
}

export function CampaignsPanel({ routes, onSelectionChange }: CampaignsPanelProps) {
  const [busModels, setBusModels] = useState<BusModel[]>([]);
  const [busModelId, setBusModelId] = useState<number | null>(null);
  const [co2Data, setCo2Data] = useState<Co2SavingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const routeMap = useMemo(() => {
    const m = new Map<string, RouteWithShapes>();
    for (const r of routes) m.set(r.routeId, r);
    return m;
  }, [routes]);

  // Agency ids derived from the agency-filtered routes prop (empty = show all agencies)
  const visibleAgencyIds = useMemo(
    () => new Set(routes.map((r) => r.agencyId)),
    [routes]
  );

  // co2Data filtered to only the agencies present in filteredRoutes
  const filteredCo2Data = useMemo(
    () =>
      visibleAgencyIds.size === 0
        ? co2Data
        : co2Data.filter((d) => visibleAgencyIds.has(d.agencyId)),
    [co2Data, visibleAgencyIds]
  );

  // Keep selected route valid when the agency filter changes
  useEffect(() => {
    if (filteredCo2Data.length === 0) return;
    const stillValid = filteredCo2Data.some((d) => d.routeId === selectedRouteId);
    if (!stillValid) {
      selectRoute(filteredCo2Data[0].routeId, filteredCo2Data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCo2Data]);

  const selectRoute = useCallback(
    (routeId: string, data: Co2SavingsItem[]) => {
      const route = routeMap.get(routeId);
      const bounds = route ? computeBounds(route.coordinates) : null;
      const colorMap = new Map(data.map((d) => [d.routeId, d.agencyColor]));
      setSelectedRouteId(routeId);
      onSelectionChange(routeId, bounds, colorMap);
    },
    [routeMap, onSelectionChange]
  );

  // Fetch bus models once on mount
  useEffect(() => {
    getBusModels()
      .then((models) => {
        setBusModels(models);
        if (models.length > 0) setBusModelId(models[0].id);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error cargando modelos");
        setLoading(false);
      });
  }, []);

  // Fetch co2 savings whenever busModelId changes
  useEffect(() => {
    if (busModelId === null) return;
    setLoading(true);
    setError(null);
    getCo2Savings(busModelId)
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.score - a.score);
        setCo2Data(sorted);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando datos")
      )
      .finally(() => setLoading(false));
  }, [busModelId]);

  const selectedItem = useMemo(
    () => filteredCo2Data.find((d) => d.routeId === selectedRouteId) ?? null,
    [filteredCo2Data, selectedRouteId]
  );

  const dayStats = useMemo(() => {
    if (!selectedItem?.detallesPorDia) return null;
    const det = selectedItem.detallesPorDia;
    const days = DAY_LABELS.map(({ key, short, name }) => ({
      key,
      short,
      name,
      viajes: det[key]?.viajes ?? 0,
      pasajeros: det[key]?.pasajeros ?? 0,
    }));
    const maxViajes = Math.max(...days.map((d) => d.viajes), 1);
    const totalViajes = days.reduce((s, d) => s + d.viajes, 0);
    const peakDay = days.reduce(
      (best, d) => (d.viajes > best.viajes ? d : best),
      days[0]
    );
    return { days, maxViajes, totalViajes, peakDay };
  }, [selectedItem]);

  const retry = useCallback(() => {
    if (busModelId === null) return;
    setLoading(true);
    setError(null);
    getCo2Savings(busModelId)
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.score - a.score);
        setCo2Data(sorted);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  }, [busModelId]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* [1] Bus model selector */}
      <div className="p-4 border-b border-border shrink-0">
        <label className="text-xs text-text-muted mb-1.5 block">
          Modelo de Bus
        </label>
        <Select
          value={busModelId !== null ? String(busModelId) : ""}
          onValueChange={(v) => setBusModelId(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un modelo" />
          </SelectTrigger>
          <SelectContent>
            {busModels.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.manufacturer} {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <>
            {/* [2] Route detail card */}
            {selectedItem && (
              <div className="p-4 border-b border-border">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedItem.agencyColor }}
                    />
                    <span className="font-semibold text-sm truncate">
                      {selectedItem.routeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-text-muted">
                      {selectedItem.score} pts
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs border", PRIORITY_CLASS[selectedItem.prioridad])}
                    >
                      {selectedItem.prioridad}
                    </Badge>
                  </div>
                </div>

                {/* Day detail */}
                {dayStats ? (
                  <>
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Afluencia por día
                      </p>
                    </div>
                    <p className="text-xs text-text-muted mb-3 leading-relaxed">
                      Muestra cuántos servicios (<span className="text-foreground font-medium">viajes</span>) opera
                      esta ruta cada día y los <span className="text-foreground font-medium">pasajeros</span> estimados
                      que transporta. La barra indica la intensidad relativa respecto al día de mayor demanda.
                    </p>
                    {/* Column headers */}
                    <div className="flex items-center gap-2 px-2 mb-1 text-xs text-text-muted">
                      <span className="w-4 shrink-0" />
                      <span className="flex-1" />
                      <span className="w-8 text-right shrink-0">Viajes</span>
                      <span className="w-14 text-right shrink-0">Pasajeros</span>
                    </div>
                    <div className="space-y-1">
                      {dayStats.days.map((day) => {
                        const barPct = (day.viajes / dayStats.maxViajes) * 100;
                        const isPeak = day.key === dayStats.peakDay.key;
                        return (
                          <div
                            key={day.key}
                            className={cn(
                              "flex items-center gap-2 rounded px-2 py-1 text-xs",
                              isPeak && "bg-primary/10 font-semibold"
                            )}
                          >
                            <span className="w-4 shrink-0 text-text-muted">
                              {day.short}
                            </span>
                            <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right tabular-nums shrink-0">
                              {day.viajes}
                            </span>
                            <span className="w-14 text-right text-text-muted tabular-nums shrink-0">
                              {day.pasajeros.toLocaleString("es-MX")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {dayStats.maxViajes > 0 && dayStats.days.every((d) => d.viajes === dayStats.days[0].viajes) && dayStats.days[0].viajes > 0 && (
                      <p className="text-xs text-text-muted mt-2 italic">
                        Todos los días tienen el mismo número de viajes — las barras aparecen uniformes.
                      </p>
                    )}

                    {/* Footer metrics */}
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="text-xs text-text-muted mb-0.5">Día pico</p>
                        <p className="text-sm font-semibold">
                          {dayStats.peakDay.name}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-text-muted mb-0.5">CO₂ evit/año</p>
                        <p className="text-sm font-semibold">
                          {selectedItem.ahorroTon.toLocaleString("es-MX")}t
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-text-muted mb-0.5">Viajes/semana</p>
                        <p className="text-sm font-semibold">
                          {dayStats.totalViajes.toLocaleString("es-MX")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-muted text-center py-4">
                    Sin datos de afluencia disponibles para esta ruta
                  </p>
                )}
              </div>
            )}

            {/* [3] Ranking section */}
            <div className="p-4">
              <p className="text-sm font-semibold mb-1">Ranking de Corredores</p>
              <p className="text-xs text-text-muted mb-3 leading-relaxed">
                Ordenado por <span className="text-foreground font-medium">score</span> descendente.
                El score representa el CO₂ evitado por km de ruta al electrificar la línea con el modelo
                de bus seleccionado — a mayor score, mayor impacto ambiental potencial.
              </p>
              {/* Column headers */}
              <div className="flex items-center gap-3 px-3 mb-1 text-xs text-text-muted">
                <span className="w-5 shrink-0">#</span>
                <span className="w-2 shrink-0" />
                <span className="flex-1">Corredor</span>
                <span className="shrink-0">Score</span>
                <span className="shrink-0">Prioridad</span>
              </div>
              <div className="space-y-0.5">
                {filteredCo2Data.map((item, idx) => {
                  const isActive = item.routeId === selectedRouteId;
                  return (
                    <button
                      key={item.routeId}
                      onClick={() => selectRoute(item.routeId, filteredCo2Data)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors",
                        "hover:bg-surface-light",
                        isActive
                          ? "border-l-2 border-primary bg-primary/5 pl-2.5"
                          : "border-l-2 border-transparent"
                      )}
                    >
                      <span className="text-xs text-text-muted w-5 shrink-0 tabular-nums">
                        #{idx + 1}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.agencyColor }}
                      />
                      <span className="flex-1 truncate font-medium">
                        {item.routeName}
                      </span>
                      <span className="text-xs text-text-muted shrink-0 tabular-nums">
                        {item.score} pts
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs border shrink-0",
                          PRIORITY_CLASS[item.prioridad]
                        )}
                      >
                        {item.prioridad}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
