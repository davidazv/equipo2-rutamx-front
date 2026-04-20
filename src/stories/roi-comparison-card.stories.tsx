import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";

const MOCK_MODELS = [
  { id: 1, name: "E12", manufacturer: "Yutong", fuelType: "ELECTRIC" as const, autonomyKm: 250, passengerCapacity: 80, unitCostUsd: 280000, batteryCapacityKwh: 350, energyConsumptionKwhKm: 1.2, fuelConsumptionLKm: 0, maintenanceCostPerKm: 0.8, co2EmissionsGKm: 0 },
  { id: 2, name: "K9", manufacturer: "BYD", fuelType: "ELECTRIC" as const, autonomyKm: 220, passengerCapacity: 70, unitCostUsd: 320000, batteryCapacityKwh: 300, energyConsumptionKwhKm: 1.1, fuelConsumptionLKm: 0, maintenanceCostPerKm: 0.7, co2EmissionsGKm: 0 },
];

const MOCK_ROUTES = [
  { routeId: "mb-1", agencyId: "MB", routeShortName: "MB L1", routeLongName: "Indios Verdes - El Buen Fin", routeType: 3, distanceKm: 20 },
  { routeId: "mb-2", agencyId: "MB", routeShortName: "MB L2", routeLongName: "Tacubaya - Tepalcates", routeType: 3, distanceKm: 18 },
];

const meta = {
  title: "Shared/ROIComparisonCard",
  component: ROIComparisonCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ROIComparisonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    busModels: MOCK_MODELS,
    routes: MOCK_ROUTES,
  },
};

export const CustomWidth: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ROIComparisonCard busModels={MOCK_MODELS} routes={MOCK_ROUTES} />
    </div>
  ),
};
