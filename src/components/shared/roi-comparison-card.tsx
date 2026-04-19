"use client";

import { useEffect, useState, useCallback } from "react";
import { Info } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  estimateRoi,
  type BusModelResponse,
  type RouteResponse,
  type RoiEstimateResponse,
} from "@/lib/api/roi";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface ROIComparisonCardProps {
  busModels: BusModelResponse[];
  routes: RouteResponse[];
  className?: string;
}

export function ROIComparisonCard({ busModels, routes, className }: ROIComparisonCardProps) {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.routeId ?? "");
  const [selectedModel, setSelectedModel] = useState<number | null>(
    busModels[0]?.id ?? null
  );
  const [buses, setBuses] = useState(10);
  const [showInfo, setShowInfo] = useState(false);
  const [est, setEst] = useState<RoiEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoi = useCallback(async () => {
    if (!selectedRoute || selectedModel === null || buses < 1) return;
    try {
      const result = await estimateRoi(selectedRoute, selectedModel, buses);
      setEst(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error estimando ROI");
      setEst(null);
    }
  }, [selectedRoute, selectedModel, buses]);

  useEffect(() => {
    fetchRoi();
  }, [fetchRoi]);

  const fmt = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(1)}M`
      : `$${Math.round(v).toLocaleString("es-MX")}`;

  const monthlyROI = MONTHS.map((month, i) => ({
    month,
    roi: est ? ((est.netAnnualReturn / 12) * (i + 1)) / est.totalInvestmentMXN * 100 : 0,
  }));

  const maxROI = monthlyROI[11]?.roi ?? 1;

  return (
    <Card className={cn(className)}>
      <div className="grid lg:grid-cols-2 divide-x divide-border/30">
        {/* LEFT: ROI por mes */}
        <div className="p-4">
          <div className="relative mb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI Proyectado por Mes
            </CardTitle>
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
            {showInfo && (
              <div className="absolute top-6 right-0 z-10 w-60 p-3 bg-background border border-border rounded-lg shadow-lg">
                <p className="text-xs font-medium mb-2">Como leer las barras:</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-3 w-4 rounded flex-shrink-0 mt-0.5 bg-primary/60" />
                    <span><strong>Azul:</strong> ROI acumulado proyectado al mes indicado</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Muestra como crece el retorno de inversion mes a mes.
                </p>
              </div>
            )}
            {est && (
              <p className="text-2xl font-bold tracking-tight tabular-nums mt-1">
                {est.roiPercent.toFixed(1)}%
                <span className="text-xs font-normal text-muted-foreground ml-2">ROI ano 1</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            {monthlyROI.map(({ month, roi }) => (
              <div key={month} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-7 shrink-0">{month}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-300"
                    style={{ width: `${(roi / maxROI) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-right w-12 shrink-0 font-medium tabular-nums">
                  {roi.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-full bg-primary/60" />
              <span className="text-xs text-muted-foreground">ROI acumulado proyectado</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Estimador */}
        <div className="p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
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
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Modelo de bus</label>
                <select
                  value={selectedModel ?? ""}
                  onChange={(e) => setSelectedModel(Number(e.target.value))}
                  className="w-full text-xs bg-muted border border-border rounded-md px-2 py-1.5"
                >
                  {busModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.manufacturer} {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground shrink-0">Buses:</label>
              <input
                type="number"
                min={1}
                max={200}
                value={buses}
                onChange={(e) => setBuses(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-xs bg-muted border border-border rounded-md px-2 py-1.5"
              />
              <div className="flex gap-1">
                {[5, 10, 20, 50].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBuses(n)}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full border transition-colors",
                      buses === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            {est && (
              <div className="space-y-1.5 pt-1">
                <div className="p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Recuperacion</p>
                  <p className="text-lg font-bold tabular-nums">{est.paybackYears.toFixed(1)} anos</p>
                </div>

                <div className="p-2 rounded-lg bg-muted space-y-1">
                  <p className="text-xs font-medium">Costo operativo anual (electrico vs diesel)</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Electrico</span>
                    <span className="text-primary font-medium tabular-nums">{fmt(est.electricCostPerYear)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Diesel equiv.</span>
                    <span className="text-destructive font-medium tabular-nums">{fmt(est.dieselCostPerYear)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border/30 pt-1">
                    <span className="text-muted-foreground font-medium">Ahorro total/ano</span>
                    <span className="text-green-600 font-bold tabular-nums">{fmt(est.netAnnualReturn)}</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-muted-foreground">CO2 evitado/ano</p>
                  <p className="text-sm font-bold text-green-600 tabular-nums">
                    {Math.round(est.co2AvoidedTons).toLocaleString("es-MX")} ton
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
