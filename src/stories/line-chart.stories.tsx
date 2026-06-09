import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LineChart } from "@/components/charts/line-chart";

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ height: 320, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

export const SingleLine: Story = {
  args: {
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Pasajeros (miles)",
          data: [420, 380, 450, 510, 490, 560],
          borderColor: "#2F80ED",
          backgroundColor: "rgba(47,128,237,0.1)",
          fill: true,
        },
      ],
    },
  },
};

export const MultiLine: Story = {
  args: {
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Eléctrico kWh",
          data: [120, 135, 128, 142, 138, 155],
          borderColor: "#22C55E",
          backgroundColor: "rgba(34,197,94,0.1)",
          fill: false,
        },
        {
          label: "Diésel L",
          data: [210, 198, 220, 205, 215, 200],
          borderColor: "#F97316",
          backgroundColor: "rgba(249,115,22,0.1)",
          fill: false,
        },
      ],
    },
  },
};

export const CO2Comparison: Story = {
  args: {
    data: {
      labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
      datasets: [
        {
          label: "Emisiones CO₂ (ton)",
          data: [8400, 7900, 7200, 6100, 4800, 3200],
          borderColor: "#EF4444",
          backgroundColor: "rgba(239,68,68,0.1)",
          fill: true,
        },
      ],
    },
  },
};
