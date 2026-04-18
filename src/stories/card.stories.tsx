import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, Leaf, Bus, Route, Users, TrendingUp, TrendingDown } from "lucide-react";

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

export const KPIWithIcon: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-[520px]">
      {[
        {
          title: "Ahorro Combustible",
          value: "$4.2M MXN",
          trend: 8.3,
          trendLabel: "vs mes ant.",
          icon: <Fuel className="h-4 w-4" />,
        },
        {
          title: "CO₂ Reducido",
          value: "12,480 ton",
          trend: 14.2,
          trendLabel: "vs año ant.",
          icon: <Leaf className="h-4 w-4" />,
          valueGreen: true,
        },
      ].map((item) => (
        <Card key={item.title}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className={`text-3xl font-bold tracking-tight tabular-nums ${item.valueGreen ? "text-green-600" : ""}`}>
                  {item.value}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="tabular-nums">+{item.trend}%</span>
                  <span className="text-muted-foreground ml-1">{item.trendLabel}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {item.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const KPIStatGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-3 w-[720px]">
      {[
        { icon: Bus, label: "Total Buses", value: "148", sub: "en la flota" },
        { icon: Route, label: "Rutas Activas", value: "32", sub: "5 agencias" },
        { icon: Users, label: "Pasajeros Diarios", value: "638K", sub: "promedio" },
        { icon: TrendingUp, label: "Hora Pico", value: "8:00", sub: "42,000 pas." },
      ].map(({ icon: Icon, label, value, sub }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold leading-none tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const KPITrendDown: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-[520px]">
      {[
        { title: "Tiempo Promedio Ruta", value: "42 min", trend: -3.1, trendLabel: "vs sem. ant." },
        { title: "Incidencias Reportadas", value: "7", trend: -28.5, trendLabel: "vs mes ant." },
      ].map((item) => (
        <Card key={item.title}>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{item.value}</p>
              <div className="flex items-center gap-1 text-xs text-red-500">
                <TrendingDown className="h-3 w-3" />
                <span className="tabular-nums">{item.trend}%</span>
                <span className="text-muted-foreground ml-1">{item.trendLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
