import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const meta = {
  title: "UI/PasswordRequirements",
  component: PasswordRequirements,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    password: { control: "text" },
  },
} satisfies Meta<typeof PasswordRequirements>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { password: "" },
};

export const Partial: Story = {
  args: { password: "Hola123" },
};

export const AllMet: Story = {
  args: { password: "Segura@2025!" },
};

export const Interactive: Story = {
  args: { password: "" },
  render: () => {
    const [password, setPassword] = useState("");
    return (
      <div className="w-72 space-y-2">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Escribe una contraseña..."
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
        />
        <PasswordRequirements password={password} />
      </div>
    );
  },
};
