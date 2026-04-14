import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>A brief description of what this card contains.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">
          This is the main content area of the card. You can put any content here.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p className="text-sm text-text-secondary">A simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Status</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>Línea 1 — Metro CDMX</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Buses en ruta</span>
          <span className="font-semibold">24 / 30</span>
        </div>
      </CardContent>
    </Card>
  ),
};

export const KPI: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Total Buses", value: "148", delta: "+12%" },
        { label: "Rutas Activas", value: "32", delta: "+3%" },
        { label: "Eficiencia", value: "94.2%", delta: "-0.8%" },
        { label: "Consumo kWh", value: "2,840", delta: "-5%" },
      ].map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-xs text-text-muted text-label">{item.label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
          <p className={`text-xs mt-0.5 ${item.delta.startsWith("+") ? "text-success" : "text-danger"}`}>
            {item.delta} vs last month
          </p>
        </Card>
      ))}
    </div>
  ),
};
