"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingDown, DollarSign, Clock } from "lucide-react";
import { BusCountSelector } from "@/components/shared/bus-count-selector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  getCostBenefitReport,
  type CostBenefitReportResponse,
} from "@/lib/api/cost-benefit";
import type { BusModelResponse, RouteResponse } from "@/lib/api/roi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface CostBenefitCardProps {
  busModels: BusModelResponse[];
  routes: RouteResponse[];
  className?: string;
}

const YEAR_OPTIONS = [5, 10, 15, 20, 25, 30];

function formatMXN(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(v).toLocaleString("es-MX")}`;
}

function buildChartData(data: CostBenefitReportResponse) {
  const labels = data.points.map((p) => `Año ${p.year}`);
  const electricData = data.points.map((p) => p.electricCumulativeMXN);
  const dieselData = data.points.map((p) => p.dieselCumulativeMXN);

  const breakEvenIndex = data.points.findIndex((p) => p.breakEvenYear);
  const breakEvenData = data.points.map((p, i) =>
    i === breakEvenIndex ? p.electricCumulativeMXN : null
  );

  return {
    labels,
    datasets: [
      {
        label: `Eléctrico — ${data.electricModelName}`,
        data: electricData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: `Diésel — ${data.dieselModelName}`,
        data: dieselData,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      ...(breakEvenIndex >= 0
        ? [
            {
              label: "Punto de equilibrio",
              data: breakEvenData,
              borderColor: "#22c55e",
              backgroundColor: "#22c55e",
              pointRadius: 10,
              pointHoverRadius: 12,
              pointStyle: "star" as const,
              showLine: false,
              fill: false,
              tension: 0,
            },
          ]
        : []),
    ],
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: {
      position: "top" as const,
      labels: { color: "#475569", font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: "#ffffff",
      titleColor: "#0f172a",
      bodyColor: "#475569",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
          const v = ctx.parsed.y;
          if (v == null) return "";
          const label = ctx.dataset.label ?? "";
          const formatted = v >= 1_000_000
            ? `$${(v / 1_000_000).toFixed(1)}M`
            : `$${Math.round(v).toLocaleString("es-MX")}`;
          return `${label}: ${formatted}`;
        },
      },
    },
  },
  scales: {
    x: { grid: { color: "#e2e8f0" }, ticks: { color: "#475569" } },
    y: {
      grid: { color: "#e2e8f0" },
      ticks: {
        color: "#475569",
        callback: (v: number | string) => {
          const n = Number(v);
          if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
          if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
          return `$${n.toLocaleString("es-MX")}`;
        },
      },
    },
  },
};

export function CostBenefitCard({ busModels, routes, className }: CostBenefitCardProps) {
  const electricModels = busModels.filter((m) => m.fuelType === "ELECTRIC");
  const dieselModels = busModels.filter((m) => m.fuelType === "DIESEL");

  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.routeId ?? "");
  const [selectedElectricModel, setSelectedElectricModel] = useState<number | null>(electricModels[0]?.id ?? null);
  const [selectedDieselModel, setSelectedDieselModel] = useState<number | null>(dieselModels[0]?.id ?? null);
  const [buses, setBuses] = useState(10);
  const [years, setYears] = useState(10);
  const [data, setData] = useState<CostBenefitReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedRoute || selectedElectricModel === null || selectedDieselModel === null || buses < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCostBenefitReport(selectedRoute, selectedElectricModel, selectedDieselModel, buses, years);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo datos");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, selectedElectricModel, selectedDieselModel, buses, years]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (electricModels.length === 0 || dieselModels.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Gráfica costo-beneficio eléctrico vs diésel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Se requieren modelos eléctricos y diésel disponibles para generar la gráfica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data ? buildChartData(data) : null;
  const breakEvenPoint = data?.points.find((p) => p.breakEvenYear);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Gráfica costo-beneficio eléctrico vs diésel
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Horizonte</label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y} años</option>
              ))}
            </select>
          </div>
          <BusCountSelector value={buses} onChange={setBuses} />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="sm" />
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground">Inversión inicial</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-primary">
                  {formatMXN(data.totalInvestmentMXN)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Punto de equilibrio</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-amber-500">
                  {data.paybackYears.toFixed(1)} años
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                  <p className="text-xs text-muted-foreground">Ahorro final ({years} años)</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-green-600">
                  {formatMXN(
                    data.points[data.points.length - 1].dieselCumulativeMXN -
                    data.points[data.points.length - 1].electricCumulativeMXN
                  )}
                </p>
              </div>
            </div>

            {breakEvenPoint && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800">
                <span className="text-base">★</span>
                <span>
                  La flota eléctrica se vuelve más rentable en el{" "}
                  <span className="font-semibold">Año {breakEvenPoint.year}</span>
                  {" "}— costo acumulado eléctrico:{" "}
                  <span className="font-semibold tabular-nums">{formatMXN(breakEvenPoint.electricCumulativeMXN)}</span>
                  {" vs "}
                  <span className="font-semibold tabular-nums">{formatMXN(breakEvenPoint.dieselCumulativeMXN)}</span> diésel
                </span>
              </div>
            )}

            {chartData && (
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
