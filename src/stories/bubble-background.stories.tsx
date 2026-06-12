import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BubbleBackground } from "@/components/ui/bubble-background";

const meta = {
  title: "UI/BubbleBackground",
  component: BubbleBackground,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 400, position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BubbleBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">RutaMx</h1>
          <p className="mt-2 text-white/70">Gestión de flotas eléctricas</p>
        </div>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/60 text-sm">Mueve el cursor para interactuar</p>
      </div>
    ),
  },
};

export const CustomColors: Story = {
  args: {
    colors: {
      first: "220,38,38",
      second: "234,179,8",
      third: "34,197,94",
      fourth: "59,130,246",
      fifth: "168,85,247",
    },
    children: (
      <div className="flex h-full items-center justify-center">
        <p className="text-white font-medium">Colores personalizados</p>
      </div>
    ),
  },
};
