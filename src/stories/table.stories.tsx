import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Table, TableBody, TableCaption, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const buses = [
  { id: "EB-001", model: "Yutong E12", route: "MB-1", status: "active", battery: "92%" },
  { id: "EB-002", model: "BYD K9",     route: "MB-3", status: "charging", battery: "41%" },
  { id: "EB-003", model: "Yutong E12", route: "MB-2", status: "active", battery: "78%" },
  { id: "EB-004", model: "Proterra ZX", route: "MB-7", status: "maintenance", battery: "55%" },
  { id: "EB-005", model: "BYD K9",     route: "MB-4", status: "active", battery: "88%" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active:      "success",
  charging:    "warning",
  maintenance: "destructive",
  offline:     "secondary",
};

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Electric fleet — current status</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Battery</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buses.map((bus) => (
          <TableRow key={bus.id}>
            <TableCell className="font-mono text-xs">{bus.id}</TableCell>
            <TableCell>{bus.model}</TableCell>
            <TableCell>{bus.route}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[bus.status]}>{bus.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{bus.battery}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total units</TableCell>
          <TableCell className="text-right">{buses.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Battery</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buses.map((bus, i) => (
          <TableRow key={bus.id} className={i % 2 === 0 ? "bg-surface" : "bg-surface-light/40"}>
            <TableCell className="font-mono text-xs">{bus.id}</TableCell>
            <TableCell>{bus.model}</TableCell>
            <TableCell>{bus.battery}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
