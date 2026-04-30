"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MapPageTab } from "./use-map-page-state";

const TAB_LABELS: Record<MapPageTab, string> = {
  map: "Consumo Energético",
  fleet: "Optimización de Flota",
};

interface MapPageTabsProps {
  activeTab: MapPageTab;
  allowedTabs: readonly MapPageTab[];
  onTabChange: (tab: MapPageTab) => void;
}

export function MapPageTabs({
  activeTab,
  allowedTabs,
  onTabChange,
}: MapPageTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as MapPageTab)}
    >
      <TabsList>
        {allowedTabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
