import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BusCarousel3D } from "@/components/fleet/bus-carousel-3d";
import type { BusModel } from "@/lib/api/bus-models";

const SAMPLE_MODELS: BusModel[] = [
  {
    id: 1,
    name: "Yutong E12PRO",
    manufacturer: "Yutong",
    fuelType: "ELECTRIC",
    autonomyKm: 300,
    passengerCapacity: 85,
    unitCostUsd: 420000,
    batteryCapacityKwh: 352.08,
    energyConsumptionKwhKm: 1,
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
];

const meta = {
  title: "Fleet/BusCarousel3D",
  component: BusCarousel3D,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof BusCarousel3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    models: SAMPLE_MODELS,
  },
};

export const SingleModel: Story = {
  args: {
    models: [SAMPLE_MODELS[0]],
  },
};

export const Empty: Story = {
  args: {
    models: [],
  },
};
