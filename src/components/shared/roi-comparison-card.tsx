"use client";

import { useEffect, useState, useCallback } from "react";
import { Crown, Info, Leaf } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { BusCountSelector } from "@/components/shared/bus-count-selector";
import { cn } from "@/lib/utils";
import {
  estimateRoi,
  type BusModelResponse,
  type RouteResponse,
  type RoiEstimateResponse,
} from "@/lib/api/roi";

interface ROIComparisonCardProps {
  busModels: BusModelResponse[];
  routes: RouteResponse[];
  className?: string;
}

interface ModelEstimate {
  model: BusModelResponse;
  estimate: RoiEstimateResponse;
}

const fmt = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : `$${Math.round(v).toLocaleString("es-MX")}`;

export function ROIComparisonCard({
  busModels,
  routes,
  className,
}: ROIComparisonCardProps) {
  const [selectedRoute, setSelectedRoute] = useState(
    routes[0]?.routeId ?? ""
  );
  const [buses, setBuses] = useState(10);
  const [estimates, setEstimates] = useState<ModelEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!selectedRoute || busModels.length === 0 || buses < 1) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        busModels.map(async (model) => {
          const estimate = await estimateRoi(
            selectedRoute,
            model.id,
            buses
          );
          return { model, estimate };
        })
      );
      results.sort((a, b) => b.estimate.roiPercent - a.estimate.roiPercent);
      setEstimates(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error estimando ROI"
      );
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, busModels, buses]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const best = estimates[0] ?? null;
  const maxRoi = best?.estimate.roiPercent ?? 1;

  const selectedRouteData = routes.find((r) => r.routeId === selectedRoute);

  return (
    <Card className={cn(className)}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <CardTitle className="text-lg font-bold">
          Escenarios de expansión de flota eléctrica 12 meses
        </CardTitle>

        {/* Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Ruta
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="text-xs bg-muted border border-border rounded-md px-2 py-1.5"
              >
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.routeShortName} — {r.routeLongName?.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
            <BusCountSelector value={buses} onChange={setBuses} />
          </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive text-center py-4">
            {error}
          </p>
        )}

        {/* Content */}
        {!loading && !error && estimates.length > 0 && (
          <>
            {/* Model ranking */}
            <div className="space-y-2">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_60px_70px_80px_80px] gap-2 px-2 text-xs text-muted-foreground font-medium">
                <span>Modelo eléctrico</span>
                <span className="text-right">ROI</span>
                <span className="text-right">Recupera</span>
                <span className="text-right">Ahorro/año</span>
                <span className="text-right text-green-600 flex items-center justify-end gap-1">
                  <Leaf className="h-3 w-3" />
                  CO₂ evit.
                </span>
              </div>

              {estimates.map(({ model, estimate }, i) => {
                const isBest = i === 0;
                const barWidth =
                  maxRoi > 0
                    ? (estimate.roiPercent / maxRoi) * 100
                    : 0;

                return (
                  <div
                    key={model.id}
                    className={cn(
                      "rounded-lg border p-2 transition-colors",
                      isBest
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/50 bg-muted/30"
                    )}
                  >
                    {/* Mobile + Desktop layout */}
                    <div className="sm:grid grid-cols-[1fr_60px_70px_80px_80px] gap-2 items-center">
                      {/* Model name + bar */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {isBest && (
                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isBest && "text-primary"
                            )}
                          >
                            {model.manufacturer} {model.name}
                          </span>
                          <div className="relative group">
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            <div className="absolute left-0 bottom-full mb-1 z-10 hidden group-hover:block w-44 p-2 bg-background border border-border rounded-lg shadow-lg">
                              <p className="text-xs font-medium mb-1">Costo unitario</p>
                              <p className="text-xs tabular-nums">${model.unitCostUsd.toLocaleString("es-MX")} USD</p>
                              <p className="text-xs text-muted-foreground mt-1">Inversión total ({buses} buses)</p>
                              <p className="text-xs tabular-nums">{fmt(estimate.totalInvestmentMXN)} MXN</p>
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isBest ? "bg-primary" : "bg-primary/40"
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics - stacked on mobile, inline on desktop */}
                      <div className="flex sm:contents gap-3 mt-2 sm:mt-0 flex-wrap">
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums text-right",
                            isBest
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {estimate.roiPercent.toFixed(1)}%
                        </span>
                        <span className="text-sm tabular-nums text-right text-muted-foreground">
                          {estimate.paybackYears.toFixed(1)} años
                        </span>
                        <span className="text-sm font-medium tabular-nums text-right text-green-600">
                          {fmt(estimate.netAnnualReturn)}
                        </span>
                        <span className="text-sm font-bold tabular-nums text-right text-green-600">
                          {Math.round(
                            estimate.co2AvoidedTons
                          ).toLocaleString("es-MX")}{" "}
                          ton
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {best && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Mejor ROI
                  </p>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    {best.estimate.roiPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Recuperación
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {best.estimate.paybackYears.toFixed(1)} años
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Ahorro vs diésel
                  </p>
                  <p className="text-lg font-bold text-green-600 tabular-nums">
                    {fmt(best.estimate.netAnnualReturn)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && estimates.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No hay modelos eléctricos disponibles para comparar.
          </p>
        )}
      </div>
    </Card>
  );
}
