"use client";

import { useState } from "react";
import { Bus, Battery, DollarSign, Ruler } from "lucide-react";
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
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface BusModel {
  id: string;
  modelName: string;
  manufacturer: string;
  rangeKm: number;
  batteryCapacityKwh: number;
  chargingTimeHours: number;
  energyConsumptionKwhPerKm: number;
  passengerCapacity: number;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  weightKg: number;
  unitCostUsd: number;
  maintenanceCostPerKm: number;
  warrantyYears: number;
}

const BUS_MODELS: BusModel[] = [
  {
    id: "byd-k9",
    modelName: "K9",
    manufacturer: "BYD",
    rangeKm: 250,
    batteryCapacityKwh: 324,
    chargingTimeHours: 4,
    energyConsumptionKwhPerKm: 1.3,
    passengerCapacity: 80,
    lengthMeters: 12,
    widthMeters: 2.55,
    heightMeters: 3.36,
    weightKg: 18000,
    unitCostUsd: 550000,
    maintenanceCostPerKm: 0.15,
    warrantyYears: 12,
  },
  {
    id: "byd-k7",
    modelName: "K7",
    manufacturer: "BYD",
    rangeKm: 200,
    batteryCapacityKwh: 215,
    chargingTimeHours: 3.5,
    energyConsumptionKwhPerKm: 1.1,
    passengerCapacity: 60,
    lengthMeters: 10.5,
    widthMeters: 2.5,
    heightMeters: 3.2,
    weightKg: 14500,
    unitCostUsd: 420000,
    maintenanceCostPerKm: 0.12,
    warrantyYears: 10,
  },
  {
    id: "yutong-e12",
    modelName: "E12",
    manufacturer: "Yutong",
    rangeKm: 300,
    batteryCapacityKwh: 422,
    chargingTimeHours: 4.5,
    energyConsumptionKwhPerKm: 1.4,
    passengerCapacity: 90,
    lengthMeters: 12,
    widthMeters: 2.55,
    heightMeters: 3.4,
    weightKg: 19000,
    unitCostUsd: 480000,
    maintenanceCostPerKm: 0.14,
    warrantyYears: 8,
  },
  {
    id: "volvo-7900e",
    modelName: "7900 Electric",
    manufacturer: "Volvo",
    rangeKm: 220,
    batteryCapacityKwh: 396,
    chargingTimeHours: 6,
    energyConsumptionKwhPerKm: 1.8,
    passengerCapacity: 95,
    lengthMeters: 12,
    widthMeters: 2.55,
    heightMeters: 3.3,
    weightKg: 19500,
    unitCostUsd: 650000,
    maintenanceCostPerKm: 0.18,
    warrantyYears: 10,
  },
  {
    id: "proterra-zx5",
    modelName: "ZX5",
    manufacturer: "Proterra",
    rangeKm: 400,
    batteryCapacityKwh: 660,
    chargingTimeHours: 5,
    energyConsumptionKwhPerKm: 1.65,
    passengerCapacity: 77,
    lengthMeters: 12.2,
    widthMeters: 2.6,
    heightMeters: 3.35,
    weightKg: 17800,
    unitCostUsd: 750000,
    maintenanceCostPerKm: 0.16,
    warrantyYears: 12,
  },
  {
    id: "new-flyer-xe40",
    modelName: "Xcelsior XE40",
    manufacturer: "New Flyer",
    rangeKm: 280,
    batteryCapacityKwh: 466,
    chargingTimeHours: 4,
    energyConsumptionKwhPerKm: 1.66,
    passengerCapacity: 70,
    lengthMeters: 12.2,
    widthMeters: 2.6,
    heightMeters: 3.2,
    weightKg: 18500,
    unitCostUsd: 800000,
    maintenanceCostPerKm: 0.17,
    warrantyYears: 12,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const selectedBus = selectedBusId
    ? BUS_MODELS.find((b) => b.id === selectedBusId)
    : null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Fleet Analytics</h1>
        <p className="text-sm text-text-secondary">
          Análisis y comparación de modelos de buses eléctricos
        </p>
      </div>

      {/* Tabla comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparación de Modelos de Bus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead className="text-right">Rango</TableHead>
                  <TableHead className="text-right">Batería</TableHead>
                  <TableHead className="text-right">Consumo</TableHead>
                  <TableHead className="text-right">Capacidad</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Garantía</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BUS_MODELS.map((bus) => (
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
                    <TableCell className="font-medium">{bus.modelName}</TableCell>
                    <TableCell>{bus.manufacturer}</TableCell>
                    <TableCell className="text-right">{fmt(bus.rangeKm)} km</TableCell>
                    <TableCell className="text-right">{fmt(bus.batteryCapacityKwh)} kWh</TableCell>
                    <TableCell className="text-right">{bus.energyConsumptionKwhPerKm} kWh/km</TableCell>
                    <TableCell className="text-right">{bus.passengerCapacity} pas.</TableCell>
                    <TableCell className="text-right">${fmt(bus.unitCostUsd / 1000)}K</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{bus.warrantyYears} años</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Panel de detalle al seleccionar una fila */}
      {selectedBus && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="h-5 w-5" />
              {selectedBus.manufacturer} {selectedBus.modelName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Dimensiones
                </p>
                <p className="text-sm">
                  {selectedBus.lengthMeters}m × {selectedBus.widthMeters}m ×{" "}
                  {selectedBus.heightMeters}m
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  Tiempo de Carga
                </p>
                <p className="text-sm">{selectedBus.chargingTimeHours} horas</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Mantenimiento
                </p>
                <p className="text-sm">${selectedBus.maintenanceCostPerKm}/km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Peso</p>
                <p className="text-sm">{fmt(selectedBus.weightKg)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
