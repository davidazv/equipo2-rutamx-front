import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartWrapper } from "@/components/charts/chart-wrapper";

const meta = {
  title: "Charts/ChartWrapper",
  component: ChartWrapper,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Ejemplo de Gráfica",
    description: "Descripción del contenido",
    children: (
      <div className="flex items-center justify-center h-full text-text-muted">
        Contenido de gráfica aquí
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    title: "Cargando datos...",
    loading: true,
    children: null,
  },
};

export const WithDescription: Story = {
  args: {
    title: "Autonomía por Modelo",
    description: "Comparación de autonomía en kilómetros",
    children: (
      <div className="flex items-center justify-center h-full bg-primary/5 rounded">
        Gráfica de barras
      </div>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Capacidad de Pasajeros",
    children: (
      <div className="flex items-center justify-center h-full bg-success/5 rounded">
        Gráfica de barras
      </div>
    ),
  },
};
