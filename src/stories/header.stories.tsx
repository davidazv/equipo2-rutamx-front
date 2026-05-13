import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "@/components/layout/header";

const meta = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  argTypes: {
    userName: { control: "text" },
    userEmail: { control: "text" },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/dashboard" } },
  },
};

export const Map: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/map" } },
  },
};

export const Fleet: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/fleet" } },
  },
};

export const CustomUser: Story = {
  args: {
    userName: "Ana García",
    userEmail: "ana.garcia@rutamx.com",
  },
  parameters: {
    nextjs: { navigation: { pathname: "/dashboard" } },
  },
};
