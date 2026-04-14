import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Error" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Success: Story = {
  args: { variant: "success", children: "Active" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Pending" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
    </div>
  ),
};

export const TransitAgencies: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        { label: "Metrobús", color: "bg-metrobus" },
        { label: "Metro", color: "bg-metro" },
        { label: "RTP", color: "bg-rtp" },
        { label: "Trolebús", color: "bg-trolebus" },
        { label: "Cablebús", color: "bg-cablebus" },
      ].map((a) => (
        <span
          key={a.label}
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold text-white ${a.color}`}
        >
          {a.label}
        </span>
      ))}
    </div>
  ),
};
