import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithValue: Story = {
  args: { defaultValue: "aliosha@example.com", type: "email" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password..." },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled input", disabled: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 w-72">
      <label className="text-sm font-medium text-foreground" htmlFor="email">
        Email address
      </label>
      <Input id="email" type="email" placeholder="name@company.com" />
      <p className="text-xs text-text-muted">We'll never share your email.</p>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 w-72">
      <label className="text-sm font-medium text-foreground" htmlFor="err">
        Username
      </label>
      <Input
        id="err"
        defaultValue="taken_name"
        className="border-danger focus-visible:ring-danger"
      />
      <p className="text-xs text-danger">This username is already taken.</p>
    </div>
  ),
};
