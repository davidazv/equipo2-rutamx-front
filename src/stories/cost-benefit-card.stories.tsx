import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CostBenefitCard } from "@/components/shared/cost-benefit-card";
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
    name: "ZK5120C",
    manufacturer: "Yutong",
    fuelType: "ELECTRIC",
    autonomyKm: 130,
    passengerCapacity: 85,
    unitCostUsd: 300000,
    batteryCapacityKwh: 127.51,
    energyConsumptionKwhKm: 1.0,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
  {
    id: 4,
    name: "DMT Hybrid H8",
    manufacturer: "Yutong",
    fuelType: "DIESEL",
    autonomyKm: 400,
    passengerCapacity: 61,
    unitCostUsd: 120000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.35,
    maintenanceCostPerKm: 0.22,
    co2EmissionsGKm: 940,
  },
  {
    id: 5,
    name: "DMT Hybrid H10",
    manufacturer: "Yutong",
    fuelType: "DIESEL",
    autonomyKm: 400,
    passengerCapacity: 80,
    unitCostUsd: 150000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.40,
    maintenanceCostPerKm: 0.25,
    co2EmissionsGKm: 1070,
  },
];

const meta = {
  title: "Shared/CostBenefitCard",
  component: CostBenefitCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    busModels: mockBusModels,
    routes: mockRoutes,
  },
} satisfies Meta<typeof CostBenefitCard>;

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
