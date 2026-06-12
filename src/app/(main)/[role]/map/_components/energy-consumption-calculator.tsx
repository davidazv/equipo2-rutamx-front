"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Users, AlertTriangle, CheckCircle, Repeat, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
  getBusModels,
  calculateEnergyConsumption,
  type BusModelResponse,
  type EnergyConsumptionResponse,
} from "@/lib/api/energy";

function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function batteryColorClass(result: EnergyConsumptionResponse | null, calculating: boolean): string {
  if (!result || calculating) return "text-muted-foreground";
  if (result.batteryPercentAfter > 50) return "text-green-500";
  if (result.batteryPercentAfter > 20) return "text-yellow-500";
  return "text-red-500";
}

function calcRoundTrips(result: EnergyConsumptionResponse | null): string | number {
  if (!result) return "--";
  const consumptionPerTrip = 100 - result.batteryPercentAfter;
  if (consumptionPerTrip <= 0) return "--";
  return Math.floor(100 / (2 * consumptionPerTrip));
}

function displayValue(calculating: boolean, value: string, placeholder: string): string {
  if (calculating) return "...";
  return value || placeholder;
}

interface EnergyConsumptionCalculatorProps {
  selectedRouteId: string;
}

export function EnergyConsumptionCalculator({
  selectedRouteId,
}: EnergyConsumptionCalculatorProps) {
  const [busModels, setBusModels] = useState<BusModelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBusModelId, setSelectedBusModelId] = useState<string>("");
  const [occupancy, setOccupancy] = useState(50);

  const [result, setResult] = useState<EnergyConsumptionResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedBus = useMemo(
    () => busModels.find((b) => String(b.id) === selectedBusModelId) ?? null,
    [busModels, selectedBusModelId]
  );

  useEffect(() => {
    getBusModels()
      .then((models) => {
        const electricModels = models.filter((m) => m.fuelType === "ELECTRIC");
        setBusModels(electricModels);
        if (electricModels.length > 0) {
          setSelectedBusModelId(String(electricModels[0].id));
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando modelos")
      )
      .finally(() => setLoading(false));
  }, []);

  const fetchConsumption = useCallback(
    (routeId: string, busModelId: string, occ: number) => {
      if (!routeId || !busModelId) return;

      setCalculating(true);
      setCalcError(null);

      calculateEnergyConsumption(routeId, Number(busModelId), occ)
        .then(setResult)
        .catch((err) =>
          setCalcError(
            err instanceof Error ? err.message : "Error en calculo"
          )
        )
        .finally(() => setCalculating(false));
    },
    []
  );

  useEffect(() => {
    if (!selectedBusModelId) {
      setResult(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchConsumption(selectedRouteId, selectedBusModelId, occupancy);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedRouteId, selectedBusModelId, occupancy, fetchConsumption]);

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
    <div className="p-4 space-y-4" data-testid="simulation-form">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        Simulador de Batería
      </h3>

      {/* Bus model selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Modelo de Bus
        </label>
        <Select
          value={selectedBusModelId}
          onValueChange={setSelectedBusModelId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un modelo" />
          </SelectTrigger>
          <SelectContent>
            {busModels.map((bus) => (
              <SelectItem key={bus.id} value={String(bus.id)}>
                {bus.manufacturer} {bus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Occupancy slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Ocupacion
          </label>
          <span className="text-sm font-medium">{occupancy}%</span>
        </div>
        <Slider
          value={[occupancy]}
          onValueChange={(value) => setOccupancy(value[0])}
          min={0}
          max={100}
          step={5}
        />
      </div>

      {/* Results */}
      {calcError && (
        <div className="text-sm text-destructive text-center py-2">
          {calcError}
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-border" data-testid="simulation-result">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Ruta</span>
          <span className="text-sm font-medium">
            {displayValue(calculating, result ? `${formatNumber(result.routeDistanceKm)} km` : "", "-- km")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Consumo Estimado
          </span>
          <span className="text-sm font-medium text-primary">
            {displayValue(calculating, result ? `${formatNumber(result.estimatedConsumptionKwh)} kWh` : "", "-- kWh")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Bateria Restante
          </span>
          <span className={`text-sm font-medium ${batteryColorClass(result, calculating)}`}>
            {calculating ? "..." : result ? `${formatNumber(result.batteryPercentAfter)}%` : "--%"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Autonomia Restante
          </span>
          <span className="text-sm font-medium">
            {displayValue(calculating, result ? `${formatNumber(result.remainingRangeKm)} km` : "", "-- km")}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Repeat className="h-3 w-3" />
            Viajes ida y vuelta
          </span>
          <span className="text-sm font-bold text-primary">
            {calculating ? "..." : calcRoundTrips(result)}
          </span>
        </div>

        <div className="pt-2">
          {result && !calculating ? (
            result.canCompleteRoute ? (
              <Badge
                variant="success"
                className="w-full justify-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Puede completar la ruta
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="w-full justify-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                Bateria insuficiente
              </Badge>
            )
          ) : (
            <Badge
              variant="outline"
              className="w-full justify-center gap-1 text-muted-foreground"
            >
              Selecciona modelo de bus
            </Badge>
          )}
        </div>
      </div>

      {selectedBus && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Bus: {selectedBus.manufacturer} {selectedBus.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Capacidad: {selectedBus.batteryCapacityKwh} kWh • Rango:{" "}
            {selectedBus.autonomyKm} km
          </p>
        </div>
      )}
    </div>
  );
}
