"use client";

import { useState, useEffect, useMemo } from "react";
import { Bus, Battery, Zap, Fuel, DollarSign, Users, Lock, Leaf } from "lucide-react";
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
import { BusCarousel3D } from "@/components/fleet/bus-carousel-3d";
import { getBusModels } from "@/lib/api/bus-models";
import type { BusModel } from "@/lib/api/bus-models";
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

// ── Role gating ───────────────────────────────────────────────────────────

const FLEET_SECTIONS_BY_ROLE: Record<DashboardRole, ReadonlySet<string>> = {
  ceo:   new Set(["fleet-analytics"]),
  coo:   new Set(["fleet-analytics"]),
  cmo:   new Set([]),
  admin: new Set(["fleet-analytics"]),
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const role = useCurrentRole();
  const show = (section: string) => FLEET_SECTIONS_BY_ROLE[role].has(section);

  const [models, setModels] = useState<BusModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

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

  const selectedBus = selectedId ? models.find((m) => m.id === selectedId) ?? null : null;

  // ── KPI computations ──────────────────────────────────────────────────

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

  // ── Chart data ────────────────────────────────────────────────────────

  const comparisonData = useMemo(() => ({
    labels: models.map((b) => `${b.manufacturer} ${b.name}`),
    datasets: [{
      label: "Autonomía (km)",
      data: models.map((b) => b.autonomyKm),
      backgroundColor: "#3B82F6",
    }],
  }), [models]);

  const capacityData = useMemo(() => ({
    labels: models.map((b) => b.name),
    datasets: [{
      label: "Capacidad de Pasajeros",
      data: models.map((b) => b.passengerCapacity),
      backgroundColor: "#22C55E",
    }],
  }), [models]);

  // ── No access ─────────────────────────────────────────────────────────

  if (!show("fleet-analytics")) {
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

  // ── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary">Cargando modelos...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────

  if (error) {
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

      {/* Comparison Table (from develop) */}
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
                {models.map((bus) => (
                  <TableRow
                    key={bus.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedId === bus.id && "bg-primary/10"
                    )}
                    onClick={() =>
                      setSelectedId(selectedId === bus.id ? null : bus.id)
                    }
                  >
                    <TableCell className="font-medium">{bus.name}</TableCell>
                    <TableCell>{bus.manufacturer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {FUEL_LABELS[bus.fuelType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{fmt(bus.autonomyKm)} km</TableCell>
                    <TableCell className="text-right">{fmt(bus.batteryCapacityKwh)} kWh</TableCell>
                    <TableCell className="text-right">{bus.energyConsumptionKwhKm} kWh/km</TableCell>
                    <TableCell className="text-right">{bus.passengerCapacity} pas.</TableCell>
                    <TableCell className="text-right">${fmt(bus.unitCostUsd / 1000)}K</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Card (from develop) */}
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
                  <Zap className="h-3 w-3" />
                  Tipo de combustible
                </p>
                <p className="text-sm">{FUEL_LABELS[selectedBus.fuelType]}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Emisiones CO₂
                </p>
                <p className="text-sm">{fmt(selectedBus.co2EmissionsGKm)} g/km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  Consumo energético
                </p>
                <p className="text-sm">{selectedBus.energyConsumptionKwhKm} kWh/km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Mantenimiento
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
    </div>
  );
}
