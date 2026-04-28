"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bus, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  getBusCount,
  getModelRecommendation,
  type BusCountResponse,
  type ModelRecommendationResponse,
  type DayType,
} from "@/lib/api/fleet";
import { formatNumber } from "@/lib/utils";

const LINEAS = [
  { value: "linea 1", label: "Línea 1 — Indios Verdes – El Caminero" },
  { value: "linea 2", label: "Línea 2 — Tepalcates – Tacubaya" },
  { value: "linea 3", label: "Línea 3 — Tenayuca – Etiopía" },
  { value: "linea 4", label: "Línea 4 — Buenavista – San Lázaro" },
  { value: "linea 5", label: "Línea 5 — Río de los Remedios – Politécnico" },
  { value: "linea 6", label: "Línea 6 — Villa de Aragón – El Rosario" },
  { value: "linea 7", label: "Línea 7 — Indios Verdes – Campo Marte" },
];

const DAY_TYPES: { value: DayType; label: string }[] = [
  { value: "weekday", label: "Entre Semana" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export function CooSidebar() {
  const [linea, setLinea] = useState("linea 1");
  const [dayType, setDayType] = useState<DayType>("weekday");
  const [occupancy, setOccupancy] = useState(80);

  const [busCount, setBusCount] = useState<BusCountResponse | null>(null);
  const [modelRec, setModelRec] = useState<ModelRecommendationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    (l: string, d: DayType, o: number) => {
      setLoading(true);
      setError(null);

      Promise.all([getBusCount(l, d, o), getModelRecommendation(l, d, o)])
        .then(([bc, mr]) => {
          setBusCount(bc);
          setModelRec(mr);
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Error en cálculo"),
        )
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(linea, dayType, occupancy);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [linea, dayType, occupancy, fetchData]);

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Bus className="h-4 w-4 text-primary" />
        Optimización de Flota
      </h3>

      {/* Selectors */}
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Línea
          </label>
          <Select value={linea} onValueChange={setLinea}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINEAS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Tipo de día
          </label>
          <Select
            value={dayType}
            onValueChange={(v) => setDayType(v as DayType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_TYPES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Occupancy slider */}
      <div>
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

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {error && (
        <div className="text-sm text-destructive text-center py-2">
          {error}
        </div>
      )}

      {/* Bus Count Result */}
      {busCount && !loading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Buses recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary leading-none">
                  {busCount.recommendedBuses}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  buses en hora pico
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatNumber(busCount.peakHourDemand)}
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
                {formatNumber(busCount.avgDailyDemand)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Recommendation */}
      {modelRec && !loading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Modelo recomendado
              </span>
              <span className="text-[10px]">
                Cap. mín: {modelRec.requiredCapacity} pas.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelRec.models.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No hay modelos elegibles
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {modelRec.models.map((m) => (
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
                        {m.passengerCapacity} pas. · {m.autonomyKm} km
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
