import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner } from "@/components/ui/spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "muted", "white"],
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="default" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner variant="default" />
      <Spinner variant="muted" />
      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
        <Spinner variant="white" />
      </div>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      disabled
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 h-9 text-sm font-medium text-white opacity-80"
    >
      <Spinner size="sm" variant="white" />
      Loading...
    </button>
  ),
};
