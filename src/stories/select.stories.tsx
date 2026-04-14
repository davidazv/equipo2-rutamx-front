import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select agency..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="metrobus">Metrobús</SelectItem>
        <SelectItem value="metro">Metro CDMX</SelectItem>
        <SelectItem value="rtp">RTP</SelectItem>
        <SelectItem value="trolebus">Trolebús</SelectItem>
        <SelectItem value="cablebus">Cablebús</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithValue: Story = {
  render: () => (
    <Select defaultValue="metro">
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="metrobus">Metrobús</SelectItem>
        <SelectItem value="metro">Metro CDMX</SelectItem>
        <SelectItem value="rtp">RTP</SelectItem>
        <SelectItem value="trolebus">Trolebús</SelectItem>
        <SelectItem value="cablebus">Cablebús</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a route..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Metrobús</SelectLabel>
          <SelectItem value="mb1">Línea 1 — Buenavista</SelectItem>
          <SelectItem value="mb2">Línea 2 — Tacubaya</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Metro</SelectLabel>
          <SelectItem value="m1">Línea 1 — Observatorio</SelectItem>
          <SelectItem value="m2">Línea 2 — Cuatro Caminos</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Disabled..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="x">Option</SelectItem>
      </SelectContent>
    </Select>
  ),
};
