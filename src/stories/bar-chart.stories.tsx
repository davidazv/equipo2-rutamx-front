import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BarChart } from "@/components/charts/bar-chart";

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ height: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    data: {
      labels: ["E12PRO", "ZK5120C", "ZK5180C", "H8", "H10", "H12"],
      datasets: [
        {
          label: "Capacidad de Pasajeros",
          data: [85, 85, 140, 61, 80, 87],
          backgroundColor: "#22C55E",
        },
      ],
    },
  },
};

export const Horizontal: Story = {
  args: {
    horizontal: true,
    data: {
      labels: ["Yutong E12PRO", "Yutong ZK5120C", "Yutong ZK5180C", "DMT H8", "DMT H10", "DMT H12"],
      datasets: [
        {
          label: "Autonomía (km)",
          data: [300, 130, 120, 400, 400, 700],
          backgroundColor: "#3B82F6",
        },
      ],
    },
  },
};

export const MultipleDatasetsVertical: Story = {
  args: {
    data: {
      labels: ["E12PRO", "ZK5120C", "ZK5180C"],
      datasets: [
        {
          label: "Autonomía (km)",
          data: [300, 130, 120],
          backgroundColor: "#3B82F6",
        },
        {
          label: "Pasajeros",
          data: [85, 85, 140],
          backgroundColor: "#22C55E",
        },
      ],
    },
  },
};
