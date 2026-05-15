import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EnergyConsumptionCalculator } from "@/app/(main)/[role]/map/_components/energy-consumption-calculator";

function Wrapper() {
  return (
    <div className="max-w-lg">
      <EnergyConsumptionCalculator selectedRouteId="TR13" />
    </div>
  );
}

const meta = {
  title: "Map/EnergyConsumptionCalculator",
  component: EnergyConsumptionCalculator,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof EnergyConsumptionCalculator>;

export default meta;

/**
 * Detail view del calculador de consumo energético.
 * Muestra selector de modelo de bus y slider de ocupación.
 * Los modelos de bus se cargan del backend al montar el componente.
 */
export const Default: StoryObj = {
  render: () => <Wrapper />,
};
