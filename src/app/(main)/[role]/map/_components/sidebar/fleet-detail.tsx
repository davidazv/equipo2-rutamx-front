"use client";

import { useState, useEffect } from "react";
import { Hash, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
  getBusCount,
  getModelRecommendation,
  type BusCountResponse,
  type ModelCandidateResponse,
} from "@/lib/api/fleet";
import { getBusModels } from "@/lib/api/energy";
import { formatNumber } from "@/lib/utils";

interface FleetDetailProps {
  routeShortName: string;
  routeDistanceKm: number;
}

export function FleetDetail({
  routeShortName,
  routeDistanceKm,
}: FleetDetailProps) {
  const [models, setModels] = useState<ModelCandidateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fleetSize, setFleetSize] = useState(10);

  // Demand data — optional, only available for some routes
  const [demandData, setDemandData] = useState<BusCountResponse | null>(null);
  const [occupancy, setOccupancy] = useState(80);

  // Fetch demand data
  useEffect(() => {
    setDemandData(null);

    getBusCount(routeShortName, "weekday", occupancy)
      .then((data) => {
        setDemandData(data);
        setFleetSize(data.recommendedBuses);
      })
      .catch(() => {
        // No demand data for this route — that's OK
      });
  }, [routeShortName, occupancy]);

  // Fetch model recommendation (demand-aware), fall back to global models
  useEffect(() => {
    setLoading(true);
    setError(null);

    getModelRecommendation(routeShortName, "weekday", occupancy, fleetSize)
      .then((data) => setModels(data.models))
      .catch(() =>
        getBusModels().then((all) => {
          const eligible = all
            .filter((m) => m.fuelType === "ELECTRIC")
            .filter((m) => m.autonomyKm >= routeDistanceKm * 2)
            .sort((a, b) => a.unitCostUsd - b.unitCostUsd);
          const cheapestId = eligible[0]?.id ?? null;
          setModels(
            eligible.map((m) => ({
              id: m.id,
              name: m.name,
              manufacturer: m.manufacturer,
              passengerCapacity: m.passengerCapacity,
              autonomyKm: m.autonomyKm,
              unitCostUsd: m.unitCostUsd,
              recommended: m.id === cheapestId,
            }))
          );
        })
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando modelos")
      )
      .finally(() => setLoading(false));
  }, [routeShortName, occupancy, fleetSize, routeDistanceKm]);

  const recommended = models.find((m) => m.recommended);

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
          <Button size="sm" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Demand-based recommendation — only when data available */}
      {demandData && (
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">
            Buses recomendados
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary leading-none">
                {demandData.recommendedBuses}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                buses en hora pico
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatNumber(demandData.peakHourDemand)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                pasajeros/hora pico
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Demanda diaria promedio
            </span>
            <span className="text-sm font-medium">
              {formatNumber(demandData.avgDailyDemand)}
            </span>
          </div>

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
              min={60}
              max={95}
              step={5}
            />
          </div>
        </div>
      )}

      {/* Fleet size input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Tamaño de flota
          </label>
          {demandData && (
            <span className="text-[10px] text-muted-foreground">
              Sugerido: {demandData.recommendedBuses}
            </span>
          )}
        </div>
        <Input
          type="number"
          min={1}
          max={999}
          value={fleetSize}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) setFleetSize(Math.max(1, Math.min(999, val)));
          }}
        />
      </div>

      {/* Model comparison */}
      <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Modelos disponibles
          </p>
          <span className="text-[10px] text-muted-foreground">
            Ruta: {routeDistanceKm.toFixed(1)} km
          </span>
        </div>

        {models.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No hay modelos eléctricos disponibles
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
            {models.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs border transition-colors ${
                  m.recommended
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/30"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {m.manufacturer} {m.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {m.passengerCapacity} pas. · {m.autonomyKm} km ·{" "}
                    {Math.floor(m.autonomyKm / (routeDistanceKm * 2))} viajes i/v
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">
                    ${(m.unitCostUsd / 1000).toFixed(0)}k USD
                  </p>
                  {m.recommended && (
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
      {recommended && (
        <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">
            Costo estimado
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Costo por unidad
            </span>
            <span className="text-sm font-medium">
              ${(recommended.unitCostUsd / 1000).toFixed(0)}k USD
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Costo total flota ({fleetSize} buses)
            </span>
            <span className="text-sm font-bold text-primary">
              ${((recommended.unitCostUsd * fleetSize) / 1_000_000).toFixed(1)}M
              USD
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
