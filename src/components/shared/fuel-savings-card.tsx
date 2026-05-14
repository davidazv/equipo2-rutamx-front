"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Download, Fuel, DollarSign, Gauge, Calendar } from "lucide-react";
import { BusCountSelector } from "@/components/shared/bus-count-selector";
import * as Tabs from "@radix-ui/react-tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { cn } from "@/lib/utils";
import {
  getFuelSavings,
  type FuelSavingsResponse,
} from "@/lib/api/fuel-savings";
import {
  buildMonthlyChartData,
  buildAnnualChartData,
  buildAccumulatedChartData,
  buildCSVContent,
  formatMXN,
  formatLiters,
} from "@/lib/fuel-savings-utils";
import type { BusModelResponse, RouteResponse } from "@/lib/api/roi";

interface FuelSavingsCardProps {
  busModels: BusModelResponse[];
  routes: RouteResponse[];
  className?: string;
}

function exportCSV(data: FuelSavingsResponse, tab: string) {
  const csv = buildCSVContent(data, tab);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ahorro-combustible-${tab}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPDF(cardRef: React.RefObject<HTMLDivElement | null>) {
  if (!cardRef.current) return;
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(cardRef.current, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("l", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("ahorro-combustible.pdf");
}

export function FuelSavingsCard({ busModels, routes, className }: FuelSavingsCardProps) {
  const electricModels = busModels.filter((m) => m.fuelType === "ELECTRIC");
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.routeId ?? "");
  const [selectedModel, setSelectedModel] = useState<number | null>(electricModels[0]?.id ?? null);
  const [buses, setBuses] = useState(10);
  const [tab, setTab] = useState("anual");
  const [data, setData] = useState<FuelSavingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!selectedRoute || selectedModel === null || buses < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getFuelSavings(selectedRoute, selectedModel, buses);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo datos");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, selectedModel, buses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthlyChartData = data ? buildMonthlyChartData(data) : null;
  const annualChartData = data ? buildAnnualChartData(data) : null;
  const accumulatedChartData = data ? buildAccumulatedChartData(data) : null;

  return (
    <Card ref={cardRef} className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Proyeccion de ahorro por escenario de flota electrica
          </CardTitle>
          {data && (
            <div className="flex gap-1.5">
              <button
                onClick={() => exportCSV(data, tab)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
              <button
                onClick={() => exportPDF(cardRef)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Download className="h-3 w-3" />
                PDF
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scenario selector */}
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
            <label className="text-xs text-muted-foreground block mb-1">Modelo electrico</label>
            <select
              value={selectedModel ?? ""}
              onChange={(e) => setSelectedModel(Number(e.target.value))}
              className="w-full text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            >
              {electricModels.map((m) => (
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
            {/* KPI summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground">Ahorro anual</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-primary">
                  {formatMXN(data.fuelSavingsMXN)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <Fuel className="h-3.5 w-3.5 text-green-600" />
                  <p className="text-xs text-muted-foreground">Litros/ano</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-green-600">
                  {formatLiters(data.fuelSavingsLiters)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Precio diesel ref.</p>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  ${data.dieselReferencePriceMXN} <span className="text-xs font-normal text-muted-foreground">MXN/L</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Consumo diesel</p>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {data.dieselConsumptionLKm} <span className="text-xs font-normal text-muted-foreground">L/km</span>
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={setTab}>
              <Tabs.List className="flex border-b border-border">
                <Tabs.Trigger
                  value="anual"
                  className={cn(
                    "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                    tab === "anual"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Anual
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="acumulado"
                  className={cn(
                    "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                    tab === "acumulado"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Acumulado
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="mensual"
                  className={cn(
                    "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                    tab === "mensual"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensual
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="mensual" className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Ahorro en pesos</p>
                    <div className="h-[240px]">
                      {monthlyChartData && <BarChart data={monthlyChartData.mxn} />}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Litros diésel ahorrados</p>
                    <div className="h-[240px]">
                      {monthlyChartData && <BarChart data={monthlyChartData.liters} />}
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="anual" className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Ahorro en pesos</p>
                    <div className="h-[240px]">
                      {annualChartData && <BarChart data={annualChartData.mxn} />}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Litros diésel ahorrados</p>
                    <div className="h-[240px]">
                      {annualChartData && <BarChart data={annualChartData.liters} />}
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="acumulado" className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Ahorro acumulado en pesos</p>
                    <div className="h-[240px]">
                      {accumulatedChartData && <LineChart data={accumulatedChartData.mxn} />}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Litros acumulados ahorrados</p>
                    <div className="h-[240px]">
                      {accumulatedChartData && <LineChart data={accumulatedChartData.liters} />}
                    </div>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </>
        )}
      </CardContent>
    </Card>
  );
}
