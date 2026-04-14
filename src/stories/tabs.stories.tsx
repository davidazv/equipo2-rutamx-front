import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="fleet">Fleet</TabsTrigger>
        <TabsTrigger value="routes">Routes</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Overview content goes here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="fleet">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Fleet management content.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="routes">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Route information.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [tab, setTab] = useState("dashboard");
    return (
      <div className="flex flex-col gap-3 w-80">
        <p className="text-xs text-text-muted">Active: <strong>{tab}</strong></p>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <p className="text-sm p-3 text-text-secondary">Dashboard view</p>
          </TabsContent>
          <TabsContent value="map">
            <p className="text-sm p-3 text-text-secondary">Map view</p>
          </TabsContent>
          <TabsContent value="roi">
            <p className="text-sm p-3 text-text-secondary">ROI analysis</p>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};
