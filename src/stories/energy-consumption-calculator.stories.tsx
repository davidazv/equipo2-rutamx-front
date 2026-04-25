import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EnergyConsumptionCalculator } from "@/app/(main)/[role]/map/_components/energy-consumption-calculator";
import { useState } from "react";
import type { RouteWithShapes } from "@/lib/api/energy";

const MOCK_ROUTES: RouteWithShapes[] = [
  {
    routeId: "TR13",
    agencyId: "SEMOVI",
    routeShortName: "13",
    routeLongName: "Trolebus Linea 13",
    routeType: 11,
    routeColor: null,
    distanceKm: 20.0,
    coordinates: [
      [-99.065139, 19.345718],
      [-99.07, 19.355],
    ],
  },
];

function Wrapper() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  return (
    <div className="max-w-lg">
      <EnergyConsumptionCalculator
        routes={MOCK_ROUTES}
        selectedRouteId={selectedRouteId}
        onRouteChange={setSelectedRouteId}
      />
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
 * Estado por defecto del calculador.
 * Muestra los selectores de ruta, modelo de bus y el slider de ocupacion.
 * Los modelos de bus se cargan del backend al montar el componente.
 */
export const Default: StoryObj = {
  render: () => <Wrapper />,
};
