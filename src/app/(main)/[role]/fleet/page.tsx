"use client";

import { useState, useEffect } from "react";
import { Bus, Battery, DollarSign, Zap, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";

interface ApiBusModel {
  id: number;
  name: string;
  manufacturer: string;
  fuelType: "ELECTRIC" | "DIESEL";
  autonomyKm: number;
  passengerCapacity: number;
  unitCostUsd: number;
  batteryCapacityKwh: number;
  energyConsumptionKwhKm: number;
  fuelConsumptionLKm: number;
  maintenanceCostPerKm: number;
  co2EmissionsGKm: number;
}

function fmt(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

const FUEL_LABELS: Record<ApiBusModel["fuelType"], string> = {
  ELECTRIC: "Eléctrico",
  DIESEL: "Diésel",
};

export default function FleetPage() {
  const [buses, setBuses] = useState<ApiBusModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch("/api/bus-models")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json() as Promise<ApiBusModel[]>;
      })
      .then(setBuses)
      .catch(() => setError("No se pudieron cargar los modelos de autobús."))
      .finally(() => setLoading(false));
  }, []);

  const selectedBus = selectedBusId
    ? buses.find((b) => b.id === selectedBusId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fleet Analytics</h1>
        <p className="text-sm text-text-secondary">
          Analisis y comparacion de modelos de buses electricos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparacion de Modelos de Bus</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {error && (
            <ErrorState
              title="Error al cargar modelos"
              description={error}
            />
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Autonomía</TableHead>
                    <TableHead className="text-right">Batería</TableHead>
                    <TableHead className="text-right">Consumo</TableHead>
                    <TableHead className="text-right">Capacidad</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.map((bus) => (
                    <TableRow
                      key={bus.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedBusId === bus.id && "bg-primary/10"
                      )}
                      onClick={() =>
                        setSelectedBusId(selectedBusId === bus.id ? null : bus.id)
                      }
                    >
                      <TableCell className="font-medium">{bus.name}</TableCell>
                      <TableCell>{bus.manufacturer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {FUEL_LABELS[bus.fuelType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{fmt(bus.autonomyKm)} km</TableCell>
                      <TableCell className="text-right">{fmt(bus.batteryCapacityKwh)} kWh</TableCell>
                      <TableCell className="text-right">{bus.energyConsumptionKwhKm} kWh/km</TableCell>
                      <TableCell className="text-right">{bus.passengerCapacity} pas.</TableCell>
                      <TableCell className="text-right">${fmt(bus.unitCostUsd / 1000)}K</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBus && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="h-5 w-5" />
              {selectedBus.manufacturer} {selectedBus.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Tipo de combustible
                </p>
                <p className="text-sm">{FUEL_LABELS[selectedBus.fuelType]}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Emisiones CO₂
                </p>
                <p className="text-sm">{fmt(selectedBus.co2EmissionsGKm)} g/km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  Consumo energético
                </p>
                <p className="text-sm">{selectedBus.energyConsumptionKwhKm} kWh/km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Mantenimiento
                </p>
                <p className="text-sm">${selectedBus.maintenanceCostPerKm}/km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
