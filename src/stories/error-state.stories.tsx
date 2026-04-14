import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WifiOff, ServerCrash } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again later.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Failed to load fleet data",
    description: "Could not connect to the server. Check your connection and retry.",
    action: <Button size="sm" variant="outline">Retry</Button>,
  },
};

export const CustomIcon: Story = {
  args: {
    icon: <WifiOff className="h-6 w-6" />,
    title: "No internet connection",
    description: "Please check your network settings.",
    action: <Button size="sm">Try again</Button>,
  },
};

export const ServerError: Story = {
  render: () => (
    <ErrorState
      icon={<ServerCrash className="h-6 w-6" />}
      title="500 — Server Error"
      description="Our servers are experiencing issues. The team has been notified."
      action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Go back</Button>
          <Button size="sm">Reload page</Button>
        </div>
      }
    />
  ),
};

export const MinimalTitleOnly: Story = {
  args: {
    title: "No data available",
  },
};
