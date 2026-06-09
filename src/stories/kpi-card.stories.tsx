import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiCard } from "@/components/shared/kpi-card";
import { Bus, Leaf, Route, TrendingUp } from "lucide-react";

const meta = {
  title: "Shared/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    title: { control: "text" },
    value: { control: "text" },
    sub: { control: "text" },
  },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Total Buses",
    value: "148",
  },
};

export const WithSub: Story = {
  args: {
    title: "Rutas Activas",
    value: "32",
    sub: "5 agencias",
  },
};

export const WithIcon: Story = {
  args: {
    title: "CO₂ Reducido",
    value: "12,480 ton",
    sub: "este año",
    icon: <Leaf className="h-4 w-4" />,
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-[480px]">
      <KpiCard title="Total Buses" value="148" sub="en la flota" icon={<Bus className="h-4 w-4" />} />
      <KpiCard title="Rutas Activas" value="32" sub="5 agencias" icon={<Route className="h-4 w-4" />} />
      <KpiCard title="Pasajeros Diarios" value="638K" sub="promedio" icon={<TrendingUp className="h-4 w-4" />} />
      <KpiCard title="CO₂ Reducido" value="12,480 ton" sub="este año" icon={<Leaf className="h-4 w-4" />} />
    </div>
  ),
};
