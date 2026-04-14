import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([40]);
    return (
      <div className="flex flex-col gap-3 w-64">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Battery threshold</span>
          <span className="font-semibold text-primary">{value[0]}%</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={5}
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    );
  },
};

export const SmallRange: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[3]} min={1} max={10} step={1} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[60]} max={100} disabled />
    </div>
  ),
};
