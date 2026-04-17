import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ROIComparisonCard } from "@/components/shared/roi-comparison-card";

const meta = {
  title: "Shared/ROIComparisonCard",
  component: ROIComparisonCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ROIComparisonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomWidth: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ROIComparisonCard />
    </div>
  ),
};
