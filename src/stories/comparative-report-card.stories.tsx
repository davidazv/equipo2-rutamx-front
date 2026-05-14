import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComparativeReportCard } from "@/components/shared/comparative-report-card";
import type { BusModelResponse, RouteResponse } from "@/lib/api/roi";

const mockRoutes: RouteResponse[] = [
  {
    routeId: "TR13",
    agencyId: "SEMOVI",
    routeShortName: "13",
    routeLongName: "Trolebus Linea 13",
    routeType: 11,
    distanceKm: 20.0,
  },
  {
    routeId: "TEST_ROUTE",
    agencyId: "TROLE",
    routeShortName: "T1",
    routeLongName: "Ruta de prueba",
    routeType: 3,
    distanceKm: 15.0,
  },
];

const mockBusModels: BusModelResponse[] = [
  {
    id: 1,
    name: "E12PRO",
    manufacturer: "Yutong",
    fuelType: "ELECTRIC",
    autonomyKm: 300,
    passengerCapacity: 85,
    unitCostUsd: 420000,
    batteryCapacityKwh: 352.08,
    energyConsumptionKwhKm: 1.0,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
  {
    id: 2,
    name: "E10PRO",
    manufacturer: "Yutong",
    fuelType: "ELECTRIC",
    autonomyKm: 250,
    passengerCapacity: 70,
    unitCostUsd: 350000,
    batteryCapacityKwh: 281.92,
    energyConsumptionKwhKm: 0.9,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.11,
    co2EmissionsGKm: 0,
  },
  {
    id: 4,
    name: "DMT Hybrid H8",
    manufacturer: "Yutong",
    fuelType: "DIESEL",
    autonomyKm: 600,
    passengerCapacity: 85,
    unitCostUsd: 120000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.35,
    maintenanceCostPerKm: 0.22,
    co2EmissionsGKm: 940,
  },
  {
    id: 5,
    name: "ZK6128HGD",
    manufacturer: "Yutong",
    fuelType: "DIESEL",
    autonomyKm: 550,
    passengerCapacity: 80,
    unitCostUsd: 110000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.38,
    maintenanceCostPerKm: 0.24,
    co2EmissionsGKm: 980,
  },
];

const meta = {
  title: "Shared/ComparativeReportCard",
  component: ComparativeReportCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    busModels: mockBusModels,
    routes: mockRoutes,
  },
} satisfies Meta<typeof ComparativeReportCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyRoutes: Story = {
  args: {
    routes: [],
  },
};

export const NoElectricModels: Story = {
  args: {
    busModels: mockBusModels.filter((m) => m.fuelType === "DIESEL"),
  },
};

export const NoDieselModels: Story = {
  args: {
    busModels: mockBusModels.filter((m) => m.fuelType === "ELECTRIC"),
  },
};

export const EmptyModels: Story = {
  args: {
    busModels: [],
  },
};
