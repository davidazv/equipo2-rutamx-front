"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bus, Battery, Zap, Fuel, DollarSign, Users, Lock, Leaf,
  Ruler, Clock, Gauge, Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { BusCarousel3D } from "@/components/fleet/bus-carousel-3d";
import { getBusModels } from "@/lib/api/bus-models";
import type { BusModel } from "@/lib/api/bus-models";
import { getBusModelColor } from "@/lib/bus-model-colors";
import { getRouteTravelTimes } from "@/lib/api/energy";
import type { RouteTimeComparison } from "@/lib/api/energy";
import { getAgencies } from "@/lib/api/agencies";
import type { AgencyResponse } from "@/lib/api/agencies";
import { formatNumber, cn } from "@/lib/utils";
import { useCurrentRole, type DashboardRole } from "@/hooks/use-current-role";

// ── Helpers ──────────────────────────────────────────────────────────────

const FUEL_LABELS: Record<BusModel["fuelType"], string> = {
  ELECTRIC: "Eléctrico",
  DIESEL: "Diésel",
};

function fmt(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function varColor(v: number): string {
  if (v > 5) return "text-destructive";
  if (v < -5) return "text-success";
  return "text-warning";
}

// ── Role gating ───────────────────────────────────────────────────────────

const FLEET_SECTIONS_BY_ROLE: Record<DashboardRole, ReadonlySet<string>> = {
  ceo:   new Set(["fleet-analytics"]),
  coo:   new Set(["travel-times"]),
  cmo:   new Set([]),
  admin: new Set(["fleet-analytics", "travel-times"]),
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const role = useCurrentRole();
  const show = (section: string) => FLEET_SECTIONS_BY_ROLE[role].has(section);

  // ── Fleet-analytics state ─────────────────────────────────────────────
  const [models, setModels] = useState<BusModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ── Travel-times state ────────────────────────────────────────────────
  const [travelTimes, setTravelTimes] = useState<RouteTimeComparison[]>([]);
  const [agencies, setAgencies] = useState<AgencyResponse[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [ttLoading, setTtLoading] = useState(false);
  const [ttError, setTtError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 15;

  useEffect(() => {
    if (show("fleet-analytics")) {
      fetchModels();
    } else {
      setLoading(false);
    }
    if (show("travel-times")) {
      fetchTravelTimes();
    }
    // role is the only external value show() depends on; re-run when it resolves
    // from the URL default ("ceo") to the real stored role ("admin", "coo", etc.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function fetchModels() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusModels();
      setModels(data);
    } catch {
      setError("No se pudieron cargar los modelos de autobús.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTravelTimes() {
    setTtLoading(true);
    setTtError(null);
    try {
      const [data, agencyData] = await Promise.all([
        getRouteTravelTimes(),
        getAgencies(),
      ]);
      setTravelTimes(data);
      setAgencies(agencyData);

      // Default agency: RTP if present, otherwise first agency with route data
      const routeAgencyIds = new Set(data.map((r) => r.agencyId));
      const rtpAgency = agencyData.find(
        (a) => routeAgencyIds.has(a.agencyId) && a.agencyName.toLowerCase().includes("red de transporte de pasajeros")
      );
      const defaultAgency = rtpAgency ?? agencyData.find((a) => routeAgencyIds.has(a.agencyId));
      if (defaultAgency) setSelectedAgencyId(defaultAgency.agencyId);

      if (data.length > 0) setSelectedRouteId(data[0].routeId);
    } catch {
      setTtError("No se pudieron cargar los tiempos de recorrido.");
    } finally {
      setTtLoading(false);
    }
  }

  const selectedBus = selectedId ? models.find((m) => m.id === selectedId) ?? null : null;

  // Only show agencies with 2+ routes (1 route gives no useful chart)
  const agenciesWithData = useMemo(() => {
    const routeCount = new Map<string, number>();
    for (const r of travelTimes) {
      routeCount.set(r.agencyId, (routeCount.get(r.agencyId) ?? 0) + 1);
    }
    return agencies.filter((a) => (routeCount.get(a.agencyId) ?? 0) > 1);
  }, [travelTimes, agencies]);

  const filteredTimes = useMemo(() =>
    travelTimes.filter((r) => r.agencyId === selectedAgencyId),
  [travelTimes, selectedAgencyId]);

  const totalPages = Math.ceil(filteredTimes.length / PAGE_SIZE);
  const pagedTimes = useMemo(() =>
    filteredTimes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
  [filteredTimes, currentPage]);

  const selectedRoute = filteredTimes.find((r) => r.routeId === selectedRouteId)
    ?? filteredTimes[0]
    ?? null;

  // ── Fleet-analytics chart data ────────────────────────────────────────

  const kpis = useMemo(() => {
    if (models.length === 0) return { count: 0, avgAutonomy: 0, avgConsumption: 0, totalCapacity: 0 };
    const avgAutonomy = models.reduce((a, b) => a + b.autonomyKm, 0) / models.length;
    const electricModels = models.filter((m) => m.energyConsumptionKwhKm && m.energyConsumptionKwhKm > 0);
    const avgConsumption = electricModels.length > 0
      ? electricModels.reduce((a, b) => a + (b.energyConsumptionKwhKm ?? 0), 0) / electricModels.length
      : 0;
    const totalCapacity = models.reduce((a, b) => a + b.passengerCapacity, 0);
    return { count: models.length, avgAutonomy, avgConsumption, totalCapacity };
  }, [models]);

  const modelColors = useMemo(
    () => models.map((_, i) => getBusModelColor(i)),
    [models]
  );

  const comparisonData = useMemo(() => ({
    labels: models.map((b) => `${b.manufacturer} ${b.name}`),
    datasets: [{ label: "Autonomía (km)", data: models.map((b) => b.autonomyKm), backgroundColor: modelColors.map((c) => c.bar) }],
  }), [models, modelColors]);

  const capacityData = useMemo(() => ({
    labels: models.map((b) => b.name),
    datasets: [{ label: "Capacidad de Pasajeros", data: models.map((b) => b.passengerCapacity), backgroundColor: modelColors.map((c) => c.bar) }],
  }), [models, modelColors]);

  // ── Travel-times chart data ───────────────────────────────────────────

  const travelTimeChartData = useMemo(() => ({
    labels: filteredTimes.map((r) => r.routeShortName),
    datasets: [
      {
        label: "Tiempo Estimado (min)",
        data: filteredTimes.map((r) => r.estimatedTimeMinutes),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
      {
        label: "Tiempo Programado (min)",
        data: filteredTimes.map((r) => r.scheduledTimeMinutes),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
      },
    ],
  }), [filteredTimes]);

  // ── No access ─────────────────────────────────────────────────────────

  if (!show("fleet-analytics") && !show("travel-times")) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-light border border-border">
          <Lock className="h-5 w-5 text-text-muted" />
        </div>
        <p className="text-sm font-medium">No tienes acceso a esta sección</p>
        <p className="text-xs text-text-muted">El rol CMO no tiene historias de usuario asignadas en Flota.</p>
      </div>
    );
  }

  // ── Fleet-analytics loading / error ───────────────────────────────────

  if (show("fleet-analytics") && loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary">Cargando modelos...</p>
        </div>
      </div>
    );
  }

  if (show("fleet-analytics") && error) {
    return (
      <ErrorState
        title="Error al cargar datos"
        description={error}
        action={<Button onClick={fetchModels}>Reintentar</Button>}
      />
    );
  }

  // ── Main content ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Fleet Analytics (CEO / Admin) ── */}
      {show("fleet-analytics") && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Fleet Analytics</h1>
            <p className="text-text-secondary">Análisis y comparación de modelos de buses eléctricos</p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Modelos</p>
                    <p className="text-xl font-bold">{kpis.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Battery className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Autonomía Promedio</p>
                    <p className="text-xl font-bold">{formatNumber(kpis.avgAutonomy)} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Zap className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Consumo Promedio</p>
                    <p className="text-xl font-bold">{kpis.avgConsumption.toFixed(2)} kWh/km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Capacidad Total</p>
                    <p className="text-xl font-bold">{formatNumber(kpis.totalCapacity)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3D Carousel */}
          <BusCarousel3D models={models} />

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparación de Modelos de Bus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Autonomía</TableHead>
                      <TableHead className="text-right">Batería</TableHead>
                      <TableHead className="text-right">Consumo</TableHead>
                      <TableHead className="text-right">Capacidad</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((bus, i) => {
                      const color = getBusModelColor(i);
                      return (
                      <TableRow
                        key={bus.id}
                        className="cursor-pointer transition-colors"
                        style={selectedId === bus.id ? { backgroundColor: `${color.hex}18` } : undefined}
                        onClick={() => setSelectedId(selectedId === bus.id ? null : bus.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            {bus.name}
                          </div>
                        </TableCell>
                        <TableCell>{bus.manufacturer}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{FUEL_LABELS[bus.fuelType]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{fmt(bus.autonomyKm)} km</TableCell>
                        <TableCell className="text-right">{fmt(bus.batteryCapacityKwh ?? 0)} kWh</TableCell>
                        <TableCell className="text-right">{bus.energyConsumptionKwhKm} kWh/km</TableCell>
                        <TableCell className="text-right">{bus.passengerCapacity} pas.</TableCell>
                        <TableCell className="text-right">${fmt(bus.unitCostUsd / 1000)}K</TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detail Card */}
          {selectedBus && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  {selectedBus.manufacturer} {selectedBus.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Zap className="h-3 w-3" />Tipo de combustible
                    </p>
                    <p className="text-sm">{FUEL_LABELS[selectedBus.fuelType]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Leaf className="h-3 w-3" />Emisiones CO₂
                    </p>
                    <p className="text-sm">{fmt(selectedBus.co2EmissionsGKm ?? 0)} g/km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Battery className="h-3 w-3" />Consumo energético
                    </p>
                    <p className="text-sm">{selectedBus.energyConsumptionKwhKm} kWh/km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />Mantenimiento
                    </p>
                    <p className="text-sm">${selectedBus.maintenanceCostPerKm ?? 0}/km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartWrapper title="Autonomía por Modelo" description="Comparación de autonomía en kilómetros">
              <BarChart data={comparisonData} horizontal />
            </ChartWrapper>
            <ChartWrapper title="Capacidad de Pasajeros" description="Capacidad máxima por modelo">
              <BarChart data={capacityData} />
            </ChartWrapper>
          </div>
        </>
      )}

      {/* ── Travel Times (COO / Admin) ── */}
      {show("travel-times") && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Tiempos de Recorrido por Ruta</h1>
            <p className="text-text-secondary">Tiempos Estimados vs Programados · Detección de Variabilidad Operativa</p>
          </div>

          {ttLoading && (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-text-secondary">Cargando tiempos de recorrido...</p>
              </div>
            </div>
          )}

          {ttError && !ttLoading && (
            <ErrorState
              title="Error al cargar datos"
              description={ttError}
              action={<Button onClick={fetchTravelTimes}>Reintentar</Button>}
            />
          )}

          {!ttLoading && !ttError && travelTimes.length > 0 && (
            <Card className="border-primary/20">
              <CardContent className="space-y-4 pt-6">

                {/* Filters row */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedAgencyId}
                    onChange={(e) => {
                      setSelectedAgencyId(e.target.value);
                      setSelectedRouteId("");
                      setCurrentPage(1);
                    }}
                    className="text-sm bg-surface-light border border-border rounded-lg px-3 py-2 text-foreground"
                  >
                    {agenciesWithData.map((a) => (
                      <option key={a.agencyId} value={a.agencyId}>
                        {a.agencyName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="flex-1 min-w-48 text-sm bg-surface-light border border-border rounded-lg px-3 py-2 text-foreground"
                  >
                    {filteredTimes.map((r) => (
                      <option key={r.routeId} value={r.routeId}>
                        {r.routeShortName} — {r.routeLongName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metric mini-cards */}
                {selectedRoute && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Ruler className="h-3 w-3" />Distancia
                      </p>
                      <p className="text-base font-bold text-primary mt-1">
                        {fmt(selectedRoute.distanceKm, 1)} km
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />Tiempo Estimado
                      </p>
                      <p className="text-base font-bold text-success mt-1">
                        {selectedRoute.estimatedTimeMinutes} min
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Gauge className="h-3 w-3" />Velocidad Promedio
                      </p>
                      <p className="text-base font-bold text-warning mt-1">
                        {fmt(selectedRoute.avgSpeedKmH, 1)} km/h
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <Timer className="h-3 w-3" />Frecuencia
                      </p>
                      <p className="text-base font-bold text-destructive mt-1">
                        {selectedRoute.frequencyMinutes > 0
                          ? `c/${selectedRoute.frequencyMinutes} min`
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Line chart */}
                <ChartWrapper
                  title="Tiempos Estimados vs Programados"
                  description="Por ruta del sistema"
                >
                  <LineChart data={travelTimeChartData} />
                </ChartWrapper>

                {/* Summary table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ruta</TableHead>
                        <TableHead className="text-right">Distancia</TableHead>
                        <TableHead className="text-right">Tiempo Est.</TableHead>
                        <TableHead className="text-right">Velocidad</TableHead>
                        <TableHead className="text-right">Variabilidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedTimes.map((route) => (
                        <TableRow
                          key={route.routeId}
                          className={cn(
                            "cursor-pointer transition-colors",
                            selectedRouteId === route.routeId && "bg-primary/10"
                          )}
                          onClick={() => setSelectedRouteId(route.routeId)}
                        >
                          <TableCell className="font-medium">{route.routeShortName}</TableCell>
                          <TableCell className="text-right">{fmt(route.distanceKm, 1)} km</TableCell>
                          <TableCell className="text-right">{route.estimatedTimeMinutes} min</TableCell>
                          <TableCell className="text-right">{fmt(route.avgSpeedKmH, 1)} km/h</TableCell>
                          <TableCell className={cn("text-right font-medium", varColor(route.variabilityPercent))}>
                            {route.variabilityPercent > 0 ? "+" : ""}
                            {fmt(route.variabilityPercent, 1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-text-muted">
                      {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredTimes.length)} de {filteredTimes.length} rutas
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
