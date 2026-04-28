"use client";

import type { ReactNode } from "react";
import type { MapPageTab } from "./use-map-page-state";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { RouteList } from "./route-list";
import { EnergyConsumptionCalculator } from "./energy-consumption-calculator";
import { CooSidebar } from "./sidebar/coo-sidebar";

interface SidebarContentProps {
  activeTab: MapPageTab;
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string | null) => void;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  agencies: AgencyWithColorsResponse[];
  selectedAgencyId: string | null;
  onAgencyChange: (agencyId: string) => void;
}

export function SidebarContent({
  activeTab,
  routes,
  selectedRouteId,
  onRouteSelect,
  getRouteColor,
  agencies,
  selectedAgencyId,
  onAgencyChange,
}: SidebarContentProps): ReactNode {
  if (activeTab === "fleet") {
    return <CooSidebar />;
  }

  return (
    <>
      <RouteList
        routes={routes}
        selectedRouteId={selectedRouteId}
        onRouteSelect={onRouteSelect}
        getRouteColor={getRouteColor}
        agencies={agencies}
        selectedAgencyId={selectedAgencyId}
        onAgencyChange={onAgencyChange}
      />
      <EnergyConsumptionCalculator
        routes={routes}
        selectedRouteId={selectedRouteId}
        onRouteChange={onRouteSelect}
      />
    </>
  );
}
