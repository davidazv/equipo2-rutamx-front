import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BusCountSelector } from "@/components/shared/bus-count-selector";

const meta = {
  title: "Shared/BusCountSelector",
  component: BusCountSelector,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof BusCountSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultStory() {
  const [value, setValue] = useState(10);
  return <BusCountSelector value={value} onChange={setValue} />;
}

function CustomPresetsStory() {
  const [value, setValue] = useState(15);
  return (
    <BusCountSelector
      value={value}
      onChange={setValue}
      presets={[15, 30, 60, 100]}
    />
  );
}

function SinglePresetStory() {
  const [value, setValue] = useState(1);
  return <BusCountSelector value={value} onChange={setValue} presets={[1]} />;
}

export const Default: Story = {
  args: { value: 10, onChange: () => {} },
  render: () => <DefaultStory />,
};

export const CustomPresets: Story = {
  args: { value: 15, onChange: () => {} },
  render: () => <CustomPresetsStory />,
};

export const SinglePreset: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => <SinglePresetStory />,
};
