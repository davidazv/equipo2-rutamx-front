"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, TrendingDown, Wind, MapPin } from "lucide-react";
import { BusCountSelector } from "@/components/shared/bus-count-selector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { cn } from "@/lib/utils";
import {
  getComparativeReport,
  type ComparativeReportResponse,
} from "@/lib/api/comparative";
import type { BusModelResponse, RouteResponse } from "@/lib/api/roi";

interface ComparativeReportCardProps {
  busModels: BusModelResponse[];
  routes: RouteResponse[];
  className?: string;
}

function formatMXN(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${value.toLocaleString("es-MX")}`;
}

export function ComparativeReportCard({ busModels, routes, className }: ComparativeReportCardProps) {
  const electricModels = busModels.filter((m) => m.fuelType === "ELECTRIC");
  const dieselModels = busModels.filter((m) => m.fuelType === "DIESEL");

  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.routeId ?? "");
  const [selectedElectricModel, setSelectedElectricModel] = useState<number | null>(electricModels[0]?.id ?? null);
  const [selectedDieselModel, setSelectedDieselModel] = useState<number | null>(dieselModels[0]?.id ?? null);
  const [buses, setBuses] = useState(10);
  const [data, setData] = useState<ComparativeReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedRoute || selectedElectricModel === null || selectedDieselModel === null || buses < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getComparativeReport(selectedRoute, selectedElectricModel, selectedDieselModel, buses);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo datos");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, selectedElectricModel, selectedDieselModel, buses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = data
    ? {
        labels: ["Energía/Combustible", "Mantenimiento", "Total"],
        datasets: [
          {
            label: data.electricModelName,
            data: [data.electricCostPerYear, data.electricMaintenanceCostPerYear, data.electricTotalCostPerYear],
            backgroundColor: "#3b82f6",
          },
          {
            label: data.dieselModelName,
            data: [data.dieselCostPerYear, data.dieselMaintenanceCostPerYear, data.dieselTotalCostPerYear],
            backgroundColor: "#f59e0b",
          },
        ],
      }
    : null;

  if (electricModels.length === 0 || dieselModels.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Reporte comparativo eléctrico vs diésel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Se requieren modelos eléctricos y diésel disponibles para generar el reporte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Reporte comparativo eléctrico vs diésel</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selectors */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground block mb-1">Ruta</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            >
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.routeShortName} — {r.routeLongName?.slice(0, 30)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground block mb-1">Modelo eléctrico</label>
            <select
              value={selectedElectricModel ?? ""}
              onChange={(e) => setSelectedElectricModel(Number(e.target.value))}
              className="w-full text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            >
              {electricModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.manufacturer} {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground block mb-1">Modelo diésel</label>
            <select
              value={selectedDieselModel ?? ""}
              onChange={(e) => setSelectedDieselModel(Number(e.target.value))}
              className="w-full text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            >
              {dieselModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.manufacturer} {m.name}
                </option>
              ))}
            </select>
          </div>
          <BusCountSelector value={buses} onChange={setBuses} />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {data && !loading && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground">Ahorro anual</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-primary">
                  {formatMXN(data.annualSavingsMXN)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                  <p className="text-xs text-muted-foreground">Ahorro %</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-green-600">
                  {data.savingsPercent.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wind className="h-3.5 w-3.5 text-sky-600" />
                  <p className="text-xs text-muted-foreground">CO₂ evitado</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-sky-600">
                  {data.co2AvoidedTonsPerYear.toFixed(1)} ton
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Distancia ruta</p>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {data.routeDistanceKm} <span className="text-xs font-normal text-muted-foreground">km</span>
                </p>
              </div>
            </div>

            {/* Comparative bar chart */}
            <div className="h-[260px]">
              {chartData && <BarChart data={chartData} />}
            </div>

            {/* CO₂ comparison row */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{data.electricModelName}:</span>{" "}
                {data.electricCo2TonsPerYear} ton CO₂/año
              </span>
              <span>
                <span className="font-medium text-foreground">{data.dieselModelName}:</span>{" "}
                {data.dieselCo2TonsPerYear} ton CO₂/año
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
