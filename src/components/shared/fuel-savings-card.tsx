"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Fuel, DollarSign, Gauge, Calendar, Loader2 } from "lucide-react";
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
  readonly busModels: BusModelResponse[];
  readonly routes: RouteResponse[];
  readonly className?: string;
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

export function FuelSavingsCard({ busModels, routes, className }: FuelSavingsCardProps) {
  const electricModels = busModels.filter((m) => m.fuelType === "ELECTRIC");
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.routeId ?? "");
  const [selectedModel, setSelectedModel] = useState<number | null>(electricModels[0]?.id ?? null);
  const [buses, setBuses] = useState(10);
  const [tab, setTab] = useState("anual");
  const [data, setData] = useState<FuelSavingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  async function handleExportPdf() {
    if (!data || exportingPdf) return;
    setExportingPdf(true);
    setPdfError(null);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("l", "mm", "a4");
      const W = pdf.internal.pageSize.getWidth();
      const fmtN = (n: number) => n.toLocaleString("es-MX");

      const routeInfo = routes.find((r) => r.routeId === selectedRoute);
      const modelInfo = electricModels.find((m) => m.id === selectedModel);
      const routeLabel = routeInfo
        ? `${routeInfo.routeShortName} — ${routeInfo.routeLongName ?? ""}`
        : selectedRoute;
      const modelLabel = modelInfo
        ? `${modelInfo.manufacturer} ${modelInfo.name}`
        : `Modelo ${selectedModel}`;

      // ── Header ────────────────────────────────────────────────────────────
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, W, 22, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Proyección de Ahorro — Flota Eléctrica", 14, 14);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generado: ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`, W - 14, 14, { align: "right" });

      // ── Scenario ──────────────────────────────────────────────────────────
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("ESCENARIO", 14, 32);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Ruta: ${routeLabel}`, 14, 39);
      pdf.text(`Modelo: ${modelLabel}`, 14, 45);
      pdf.text(`Buses: ${data.numberOfBuses}`, 14, 51);
      pdf.text(`Distancia de ruta: ${data.routeDistanceKm.toFixed(1)} km`, 100, 39);
      pdf.text(`Precio diésel ref.: $${data.dieselReferencePriceMXN} MXN/L`, 100, 45);
      pdf.text(`Consumo diésel: ${data.dieselConsumptionLKm} L/km`, 100, 51);

      // ── KPI boxes ─────────────────────────────────────────────────────────
      const kpis = [
        { label: "Ahorro anual combustible", value: `$${fmtN(Math.round(data.fuelSavingsMXN))} MXN` },
        { label: "Litros diésel ahorrados/año", value: `${fmtN(Math.round(data.fuelSavingsLiters))} L` },
        { label: "Costo diésel/año (actual)", value: `$${fmtN(Math.round(data.dieselCostPerYear))} MXN` },
        { label: "Costo eléctrico/año", value: `$${fmtN(Math.round(data.electricCostPerYear))} MXN` },
      ];
      const boxW = (W - 28 - 9) / 4;
      kpis.forEach((kpi, i) => {
        const x = 14 + i * (boxW + 3);
        pdf.setFillColor(243, 244, 246);
        pdf.roundedRect(x, 58, boxW, 20, 2, 2, "F");
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(kpi.label, x + boxW / 2, 64, { align: "center" });
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(kpi.value, x + boxW / 2, 72, { align: "center" });
      });

      // ── Projection table ──────────────────────────────────────────────────
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("PROYECCIÓN ANUAL", 14, 90);

      const headers = ["Año", "Ahorro MXN", "Litros ahorrados", "Ahorro acumulado MXN", "Litros acumulados"];
      const colWidths = [18, 55, 55, 65, 55];
      const colX = colWidths.reduce<number[]>((acc, w, i) => {
        acc.push(i === 0 ? 14 : acc[i - 1] + colWidths[i - 1]);
        return acc;
      }, []);

      // Header row
      pdf.setFillColor(30, 64, 175);
      pdf.rect(14, 93, W - 28, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      headers.forEach((h, i) => {
        pdf.text(h, colX[i] + colWidths[i] / 2, 98.5, { align: "center" });
      });

      // Data rows
      pdf.setFont("helvetica", "normal");
      for (let y = 1; y <= data.projectionYears; y++) {
        const rowY = 101 + (y - 1) * 9;
        pdf.setFillColor(y % 2 === 0 ? 248 : 255, y % 2 === 0 ? 249 : 255, y % 2 === 0 ? 251 : 255);
        pdf.rect(14, rowY, W - 28, 8, "F");
        pdf.setTextColor(60, 60, 60);
        const rowData = [
          `Año ${y}`,
          `$${fmtN(Math.round(data.fuelSavingsMXN))}`,
          `${fmtN(Math.round(data.fuelSavingsLiters))} L`,
          `$${fmtN(Math.round(data.fuelSavingsMXN * y))}`,
          `${fmtN(Math.round(data.fuelSavingsLiters * y))} L`,
        ];
        rowData.forEach((cell, i) => {
          pdf.text(cell, colX[i] + colWidths[i] / 2, rowY + 5.5, { align: "center" });
        });
      }

      pdf.save("ahorro-combustible.pdf");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[exportPDF]", err);
      setPdfError(msg);
    } finally {
      setExportingPdf(false);
    }
  }

  const monthlyChartData = data ? buildMonthlyChartData(data) : null;
  const annualChartData = data ? buildAnnualChartData(data) : null;
  const accumulatedChartData = data ? buildAccumulatedChartData(data) : null;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Proyeccion de ahorro por escenario de flota electrica
          </CardTitle>
          {data && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => exportCSV(data, tab)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportingPdf
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Download className="h-3 w-3" />}
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
        {pdfError && (
          <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
            Error PDF: {pdfError}
          </p>
        )}

        {/* First-load spinner (no data yet) */}
        {loading && !data && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {data && (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
