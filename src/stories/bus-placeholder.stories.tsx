import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BusPlaceholder, BusPlaceholderSvg } from "@/components/fleet/bus-placeholder";

const meta = {
  title: "Fleet/BusPlaceholder",
  component: BusPlaceholder,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof BusPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Placeholder animado (giro en eje Y), tal como aparece en el carrusel cuando
// un modelo no tiene un .glb asociado.
export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-full rounded-lg bg-slate-100 flex items-center justify-center">
      <BusPlaceholder className="flex h-full w-full items-center justify-center" />
    </div>
  ),
};

// Solo el SVG estático, sin animación, para inspeccionar la silueta.
export const SvgOnly: Story = {
  render: () => (
    <div className="text-primary w-80">
      <BusPlaceholderSvg className="w-full" />
    </div>
  ),
};
