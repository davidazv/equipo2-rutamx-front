import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "@/components/ui/checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none cursor-pointer select-none"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const CheckboxList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { id: "metrobus", label: "Metrobús", defaultChecked: true },
        { id: "metro", label: "Metro", defaultChecked: true },
        { id: "rtp", label: "RTP", defaultChecked: false },
        { id: "trolebus", label: "Trolebús", defaultChecked: false },
      ].map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox id={item.id} defaultChecked={item.defaultChecked} />
          <label htmlFor={item.id} className="text-sm cursor-pointer">
            {item.label}
          </label>
        </div>
      ))}
    </div>
  ),
};
