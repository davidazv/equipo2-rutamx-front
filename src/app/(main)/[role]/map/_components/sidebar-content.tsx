"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Zap, Bus } from "lucide-react";
import type { MapPageTab } from "./use-map-page-state";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { formatNumber } from "@/lib/utils";
import { varyColor, ensureContrast } from "@/lib/map/color-utils";
import { RouteMasterDetail } from "./route-master-detail";
import { RouteList } from "./route-list";
import { EnergyConsumptionCalculator } from "./energy-consumption-calculator";
import { FleetDetail } from "./sidebar/fleet-detail";

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
  const [isDetailView, setIsDetailView] = useState(false);

  // Reset detail view when selected route or tab changes
  useEffect(() => {
    setIsDetailView(false);
  }, [selectedRouteId, activeTab]);

  const selectedRoute = selectedRouteId
    ? routes.find((r) => r.routeId === selectedRouteId)
    : null;

  const selectedItem = selectedRoute
    ? {
        label: `${selectedRoute.routeShortName} — ${selectedRoute.routeLongName}`,
        sublabel: `${formatNumber(selectedRoute.distanceKm, 1)} km`,
        color: ensureContrast(
          varyColor(
            getRouteColor(selectedRoute, routes.indexOf(selectedRoute)),
            selectedRoute.routeId
          )
        ),
      }
    : null;

  const title =
    activeTab === "fleet"
      ? "Optimización de Flota"
      : "Consumo Energético por Ocupación";

  const titleIcon =
    activeTab === "fleet" ? (
      <Bus className="h-4 w-4 text-primary" />
    ) : (
      <Zap className="h-4 w-4 text-primary" />
    );

  let detailContent: ReactNode = null;
  if (selectedRouteId && selectedRoute) {
    detailContent =
      activeTab === "fleet" ? (
        <FleetDetail
          routeShortName={selectedRoute.routeShortName}
          routeDistanceKm={selectedRoute.distanceKm}
        />
      ) : (
        <EnergyConsumptionCalculator selectedRouteId={selectedRouteId} />
      );
  }

  return (
    <RouteMasterDetail
      title={title}
      titleIcon={titleIcon}
      selectedItem={isDetailView ? selectedItem : null}
      onBack={() => setIsDetailView(false)}
      listContent={
        <RouteList
          routes={routes}
          selectedRouteId={selectedRouteId}
          onRouteSelect={onRouteSelect}
          onConfirm={() => setIsDetailView(true)}
          getRouteColor={getRouteColor}
          agencies={agencies}
          selectedAgencyId={selectedAgencyId}
          onAgencyChange={onAgencyChange}
        />
      }
      detailContent={detailContent}
    />
  );
}
