"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
  getBusModelRecommendation,
  type BusModelRecommendation,
} from "@/lib/api/fleet";
import { formatNumber } from "@/lib/utils";

interface FleetDetailProps {
  readonly routeId: string;
  readonly routeDistanceKm: number;
}

export function FleetDetail({
  routeId,
  routeDistanceKm,
}: FleetDetailProps) {
  const [recommendation, setRecommendation] = useState<BusModelRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState(80);
  const [committedOccupancy, setCommittedOccupancy] = useState(80);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getBusModelRecommendation(routeId, committedOccupancy)
      .then((data) => setRecommendation(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Error cargando recomendación")
      )
      .finally(() => setLoading(false));
  }, [routeId, committedOccupancy]);

  const dayRec = recommendation?.recommendations.weekday ?? null;
  const recommendedModel = dayRec?.models.find((m) => m.recommended) ?? null;
  const recommendedBuses =
    dayRec && recommendedModel
      ? Math.ceil(dayRec.peakHourDemand / (recommendedModel.model.passengerCapacity * (occupancy / 100)))
      : null;
  const recommended = recommendedModel;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando modelos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error cargando modelos"
        description={error}
        action={
          <Button size="sm" onClick={() => globalThis.window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Buses recomendados */}
      {dayRec && (
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">
            Buses recomendados
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary leading-none">
                {recommendedBuses ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                buses en hora pico
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatNumber(dayRec.peakHourDemand)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                pasajeros/hora pico
              </p>
            </div>
          </div>
          {recommendation && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Demanda diaria promedio
              </span>
              <span className="text-sm font-medium">
                {formatNumber(recommendation.demand.avgWeekday)}
              </span>
            </div>
          )}

          {/* Occupancy slider */}
          <div className="mt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Ocupación objetivo
              </label>
              <span className="text-sm font-medium">{occupancy}%</span>
            </div>
            <Slider
              value={[occupancy]}
              onValueChange={([v]) => setOccupancy(v)}
              onValueCommit={([v]) => setCommittedOccupancy(v)}
              min={60}
              max={95}
              step={5}
            />
          </div>
        </div>
      )}

      {/* Model comparison */}
      <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Modelos disponibles
          </p>
          <span className="text-[10px] text-muted-foreground">
            Ruta: {routeDistanceKm.toFixed(1)} km
            {dayRec && ` · Cap. mín: ${dayRec.requiredCapacity} pas.`}
          </span>
        </div>

        {!dayRec || dayRec.models.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No hay modelos disponibles
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
            {dayRec.models.map((rank) => (
              <div
                key={rank.model.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs border transition-colors ${
                  rank.recommended
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/30"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {rank.model.manufacturer} {rank.model.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {rank.model.passengerCapacity} pas. · {rank.model.autonomyKm} km ·{" "}
                    {Math.floor(rank.model.autonomyKm / (routeDistanceKm * 2))} viajes i/v
                    {!rank.meetsCapacity && (
                      <span className="text-destructive ml-1">· Cap. insuf.</span>
                    )}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">
                    ${formatNumber(rank.model.unitCostUsd)} USD
                  </p>
                  {rank.recommended && (
                    <Badge className="text-[9px] px-1 py-0 leading-tight mt-0.5">
                      Recomendado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet cost summary */}
      {recommended && recommendedBuses && (
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">
            Costo estimado
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Costo por unidad
            </span>
            <span className="text-sm font-medium">
              ${(recommended.model.unitCostUsd / 1000).toFixed(0)}k USD
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Costo total flota ({recommendedBuses} buses)
            </span>
            <span className="text-sm font-bold text-primary">
              ${formatNumber(recommended.model.unitCostUsd * recommendedBuses)} USD
            </span>
          </div>
        </div>
      )}

      {/* Methodology note */}
      <div className="rounded-md bg-muted/30 p-2">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Modelos filtrados por capacidad requerida y autonomía de ruta. Solo
          buses eléctricos.
        </p>
      </div>
    </div>
  );
}
