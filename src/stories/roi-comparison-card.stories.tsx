import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";

const MOCK_MODELS = [
  { id: 1, name: "E12PRO", manufacturer: "Yutong", fuelType: "ELECTRIC" as const, autonomyKm: 300, passengerCapacity: 85, unitCostUsd: 420000, batteryCapacityKwh: 352, energyConsumptionKwhKm: 1.0, fuelConsumptionLKm: 0, maintenanceCostPerKm: 0.12, co2EmissionsGKm: 0 },
  { id: 2, name: "ZK5120C", manufacturer: "Yutong", fuelType: "ELECTRIC" as const, autonomyKm: 130, passengerCapacity: 85, unitCostUsd: 300000, batteryCapacityKwh: 127, energyConsumptionKwhKm: 1.0, fuelConsumptionLKm: 0, maintenanceCostPerKm: 0.12, co2EmissionsGKm: 0 },
  { id: 3, name: "ZK5180C", manufacturer: "Yutong", fuelType: "ELECTRIC" as const, autonomyKm: 120, passengerCapacity: 140, unitCostUsd: 550000, batteryCapacityKwh: 155, energyConsumptionKwhKm: 1.3, fuelConsumptionLKm: 0, maintenanceCostPerKm: 0.15, co2EmissionsGKm: 0 },
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
  args: {
    busModels: MOCK_MODELS,
    routes: MOCK_ROUTES,
  },
} satisfies Meta<typeof ROIComparisonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleModel: Story = {
  args: {
    busModels: [MOCK_MODELS[0]],
  },
};

export const CustomWidth: Story = {
  args: {
    busModels: MOCK_MODELS,
    routes: MOCK_ROUTES,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};
