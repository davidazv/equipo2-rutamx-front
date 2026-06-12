"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FileDown, BarChart2, TrendingUp, Leaf, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import {
  getBusModels,
  getRoutes,
  type BusModelResponse as BusModel,
  type RouteResponse,
} from "@/lib/api/roi";
import { getAgenciesWithColors, type AgencyWithColorsResponse } from "@/lib/api/agencies";
import {
  getComparativeReport,
  type ComparativeReportResponse,
} from "@/lib/api/comparative";
import { getUser } from "@/lib/auth";
// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtMXN(value: number): string {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function fmtNum(value: number, decimals = 1): string {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ComparativeReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [busModels, setBusModels] = useState<BusModel[]>([]);
  const [agencies, setAgencies] = useState<AgencyWithColorsResponse[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [routeId, setRouteId] = useState("");
  const [electricModelId, setElectricModelId] = useState("");
  const [dieselModelId, setDieselModelId] = useState("");
  const [buses, setBuses] = useState("10");
  const [years, setYears] = useState("10");

  const [report, setReport] = useState<ComparativeReportResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRoutes(), getBusModels(), getAgenciesWithColors()])
      .then(([r, b, a]) => {
        setRoutes(r);
        setBusModels(b);
        setAgencies(a);
        if (a.length > 0) setSelectedAgency(a[0].agencyId);
      })
      .catch(() => setCatalogError("No se pudieron cargar rutas o modelos de bus."))
      .finally(() => setLoadingCatalog(false));
  }, []);

  const filteredRoutes = useMemo(
    () => routes.filter((r) => r.agencyId === selectedAgency),
    [routes, selectedAgency]
  );

  const electricModels = useMemo(
    () => busModels.filter((m) => m.fuelType === "ELECTRIC"),
    [busModels]
  );
  const dieselModels = useMemo(
    () => busModels.filter((m) => m.fuelType === "DIESEL"),
    [busModels]
  );

  const canGenerate =
    routeId && electricModelId && dieselModelId && Number(buses) >= 1;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setReportError(null);
    setReport(null);
    try {
      const data = await getComparativeReport({
        routeId,
        electricModelId: Number(electricModelId),
        dieselModelId: Number(dieselModelId),
        buses: Number(buses),
        years: Number(years),
      });
      setReport(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Error al generar el reporte");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!reportRef.current || !report) return;

    // Chrome 116+ returns oklch/oklab from getComputedStyle; html2canvas can't parse them.
    // Pre-convert those values to rgb on a 1×1 canvas before html2canvas clones the DOM.
    // All CSS color functions html2canvas can't parse (includes SVG fill/stroke).
    const COLOR_PROPS = [
      "color", "background-color",
      "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
      "fill", "stroke",
    ];
    const MODERN_COLOR_RE = /\b(?:ok)?l(?:ab|ch)\(|color-mix\(/i;
    const saved = new Map<Element, Array<{ prop: string; prev: string }>>();

    const resolverCanvas = document.createElement("canvas");
    resolverCanvas.width = resolverCanvas.height = 1;
    const resolverCtx = resolverCanvas.getContext("2d");

    if (resolverCtx) {
      const toRgba = (val: string) => {
        resolverCtx.clearRect(0, 0, 1, 1);
        resolverCtx.fillStyle = val;
        resolverCtx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = resolverCtx.getImageData(0, 0, 1, 1).data;
        return a < 255 ? `rgba(${r},${g},${b},${(a / 255).toFixed(4)})` : `rgb(${r},${g},${b})`;
      };

      reportRef.current.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const cs = globalThis.window.getComputedStyle(htmlEl);
        const overrides: Array<{ prop: string; prev: string }> = [];
        COLOR_PROPS.forEach((prop) => {
          const val = cs.getPropertyValue(prop);
          if (val && MODERN_COLOR_RE.test(val)) {
            overrides.push({ prop, prev: htmlEl.style.getPropertyValue(prop) });
            htmlEl.style.setProperty(prop, toRgba(val), "important");
          }
        });
        if (overrides.length) saved.set(el, overrides);
      });
    }

    try {
      const { default: JsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();

      // ── Metadata header ───────────────────────────────────────────────────
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-MX", {
        year: "numeric", month: "long", day: "numeric",
      });
      const timeStr = now.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit",
      });
      const currentUser = getUser();

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text("RutaMX — Reporte Comparativo Eléctrico vs Diésel", 10, 10);
      pdf.text(`${dateStr}  ${timeStr}`, pageWidth - 10, 10, { align: "right" });

      if (currentUser) {
        pdf.text(
          `Generado por: ${currentUser.firstName} ${currentUser.lastName}  ·  ${currentUser.email}`,
          10, 15,
        );
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, 18, pageWidth - 10, 18);
      // ─────────────────────────────────────────────────────────────────────

      const imgY = 21;
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, imgY, imgWidth, imgHeight);
      pdf.save(`reporte-comparativo-${report.routeId}.pdf`);
    } finally {
      saved.forEach((overrides, el) => {
        const htmlEl = el as HTMLElement;
        overrides.forEach(({ prop, prev }) => {
          if (prev) htmlEl.style.setProperty(prop, prev);
          else htmlEl.style.removeProperty(prop);
        });
      });
    }
  }

  // ── Catálogo cargando ────────────────────────────────────────────────────

  if (loadingCatalog) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  if (catalogError) {
    return (
      <ErrorState
        title="Error cargando catálogos"
        description={catalogError}
        action={<Button onClick={() => globalThis.window.location.reload()}>Reintentar</Button>}
      />
    );
  }

  // ── Chart data ────────────────────────────────────────────────────────────

  const barData = report
    ? {
        labels: ["Combustible / Energía", "Mantenimiento"],
        datasets: [
          {
            label: `Eléctrico (${report.electricModelName})`,
            data: [report.electricCostPerYear, report.electricMaintenancePerYear],
            backgroundColor: "#22C55E",
          },
          {
            label: `Diésel (${report.dieselModelName})`,
            data: [report.dieselCostPerYear, report.dieselMaintenancePerYear],
            backgroundColor: "#F97316",
          },
        ],
      }
    : null;

  const lineData = report
    ? {
        labels: report.tcoProjection.map((p) => `Año ${p.year}`),
        datasets: [
          {
            label: `TCO Eléctrico (${report.electricModelName})`,
            data: report.tcoProjection.map((p) => p.electricTCO),
            borderColor: "#22C55E",
            backgroundColor: "rgba(34,197,94,0.08)",
            fill: true,
            tension: 0.4,
          },
          {
            label: `TCO Diésel (${report.dieselModelName})`,
            data: report.tcoProjection.map((p) => p.dieselTCO),
            borderColor: "#F97316",
            backgroundColor: "rgba(249,115,22,0.08)",
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reporte Comparativo</h1>
          <p className="text-sm text-text-secondary">
            Eléctrico vs Diésel — análisis de TCO y reducción de emisiones
          </p>
        </div>
        {report && (
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        )}
      </div>

      {/* Formulario de parámetros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parámetros del reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Medio de transporte */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Medio de transporte</label>
              <Select
                value={selectedAgency}
                onValueChange={(v) => {
                  setSelectedAgency(v);
                  setRouteId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar agencia" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => (
                    <SelectItem key={a.agencyId} value={a.agencyId}>
                      {a.agencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ruta */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Ruta</label>
              <Select value={routeId} onValueChange={setRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ruta" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoutes.map((r) => (
                    <SelectItem key={r.routeId} value={r.routeId}>
                      {r.routeShortName} — {r.routeLongName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo eléctrico */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Modelo eléctrico</label>
              <Select value={electricModelId} onValueChange={setElectricModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {electricModels.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.manufacturer} {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo diésel */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Modelo diésel (referencia)</label>
              <Select value={dieselModelId} onValueChange={setDieselModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {dieselModels.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.manufacturer} {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número de buses */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Número de buses</label>
              <Select value={buses} onValueChange={setBuses}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 30, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} buses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Años de proyección */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Años de proyección</label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} años
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón generar */}
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
              >
                {generating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Generar reporte
                  </>
                )}
              </Button>
            </div>
          </div>

          {reportError && (
            <p className="mt-3 text-sm text-destructive">{reportError}</p>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      {report && (
        <div ref={reportRef} className="space-y-6">
          {/* KPI cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Ahorro anual neto</p>
                    <p className="text-xl font-bold text-green-600">
                      {fmtMXN(report.netAnnualSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">ROI</p>
                    <p className="text-xl font-bold">
                      {fmtNum(report.roiPercent)}%
                    </p>
                    <p className="text-xs text-text-muted">
                      Payback: {fmtNum(report.paybackYears)} años
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">CO₂ evitado/año</p>
                    <p className="text-xl font-bold text-green-600">
                      {fmtNum(report.co2AvoidedTonsPerYear)} ton
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Inversión total</p>
                    <p className="text-xl font-bold">
                      {fmtMXN(report.totalInvestmentMXN)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {report.numberOfBuses} buses · {report.distanceKm.toFixed(1)} km
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficas */}
          <div className="grid gap-4 lg:grid-cols-2">
            {barData && (
              <ChartWrapper
                title="Costos anuales comparativos"
                description="Combustible/energía y mantenimiento por año (MXN)"
              >
                <BarChart data={barData} />
              </ChartWrapper>
            )}

            {lineData && (
              <ChartWrapper
                title={`TCO acumulado a ${report.projectionYears} años`}
                description={
                  report.paybackYear > 0
                    ? `Punto de equilibrio en el año ${report.paybackYear}`
                    : "El punto de equilibrio supera el horizonte de proyección"
                }
              >
                <LineChart data={lineData} />
              </ChartWrapper>
            )}
          </div>

          {/* Detalle de la ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalle del análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
                <div>
                  <dt className="text-xs text-text-secondary">Ruta</dt>
                  <dd className="font-medium">{report.routeName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Distancia</dt>
                  <dd className="font-medium">{report.distanceKm.toFixed(1)} km</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Modelo eléctrico</dt>
                  <dd className="font-medium">{report.electricModelName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Modelo diésel (referencia)</dt>
                  <dd className="font-medium">{report.dieselModelName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Costo energía eléctrica/año</dt>
                  <dd className="font-medium text-green-600">{fmtMXN(report.electricCostPerYear)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Costo combustible diésel/año</dt>
                  <dd className="font-medium text-orange-500">{fmtMXN(report.dieselCostPerYear)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Mantenimiento eléctrico/año</dt>
                  <dd className="font-medium">{fmtMXN(report.electricMaintenancePerYear)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Mantenimiento diésel/año</dt>
                  <dd className="font-medium">{fmtMXN(report.dieselMaintenancePerYear)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Años proyectados</dt>
                  <dd className="font-medium">{report.projectionYears} años</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
