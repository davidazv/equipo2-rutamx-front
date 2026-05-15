"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getRoutesWithShapes,
  type RouteWithShapes,
} from "@/lib/api/energy";
import {
  getAgenciesWithColors,
  type AgencyWithColorsResponse,
} from "@/lib/api/agencies";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { DEFAULT_ROUTE_COLOR } from "@/constants/map";
import { cn } from "@/lib/utils";
import { MapContainer } from "./_components/map-container";
import { MapPageTabs } from "./_components/map-page-tabs";
import { SidebarContent } from "./_components/sidebar-content";
import { CampaignsPanel } from "./_components/campaigns-panel";
import { FleetPanel } from "./_components/fleet-panel";
import { AgencyFilterBar } from "./_components/agency-filter-bar";
import { useMapPageState } from "./_components/use-map-page-state";

export default function MapPage() {
  const { activeTab, setActiveTab, allowedTabs } = useMapPageState();

  // ── Base data (shared across all tabs) ────────────────────────────────────
  const [routes, setRoutes] = useState<RouteWithShapes[]>([]);
  const [agencies, setAgencies] = useState<AgencyWithColorsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // ── Agency filter (shared across all tabs, empty = show all) ─────────────
  const [activeAgencyIds, setActiveAgencyIds] = useState<Set<string>>(new Set());

  // ── Campaign tab map state ────────────────────────────────────────────────
  const [campaignRouteId, setCampaignRouteId] = useState<string | null>(null);
  const [campaignBounds, setCampaignBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);
  const [campaignColorMap, setCampaignColorMap] = useState<Map<string, string>>(
    new Map()
  );

  // ── Fleet tab map state ───────────────────────────────────────────────────
  const [fleetRouteId, setFleetRouteId] = useState<string | null>(null);
  const [fleetBounds, setFleetBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);
  const [fleetColorMap, setFleetColorMap] = useState<Map<string, string>>(
    new Map()
  );

  useEffect(() => {
    Promise.all([getRoutesWithShapes(), getAgenciesWithColors()])
      .then(([routesData, agenciesData]) => {
        setRoutes(routesData);
        setAgencies(agenciesData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error cargando rutas")
      )
      .finally(() => setLoading(false));
  }, []);

  const agencyColorMap = useMemo(() => {
    const map = new Map<string, AgencyWithColorsResponse>();
    for (const a of agencies) map.set(a.agencyId, a);
    return map;
  }, [agencies]);

  const resolveColor = useCallback(
    (route: RouteWithShapes, _index: number): string => {
      if (route.routeColor) return `#${route.routeColor}`;
      const agency = agencyColorMap.get(route.agencyId);
      if (agency?.agencyColor) return `#${agency.agencyColor}`;
      return DEFAULT_ROUTE_COLOR;
    },
    [agencyColorMap]
  );

  // ── Agency filter ─────────────────────────────────────────────────────────
  const toggleAgency = useCallback((agencyId: string) => {
    setActiveAgencyIds((prev) => {
      const next = new Set(prev);
      if (next.has(agencyId)) {
        next.delete(agencyId);
      } else {
        next.add(agencyId);
      }
      return next;
    });
  }, []);

  // filteredRoutes: applied to the map routes prop on every tab
  const filteredRoutes = useMemo(
    () =>
      activeAgencyIds.size === 0
        ? routes
        : routes.filter((r) => activeAgencyIds.has(r.agencyId)),
    [routes, activeAgencyIds]
  );

  const visibleAgencyIds = useMemo(
    () => [...new Set(filteredRoutes.map((r) => r.agencyId))],
    [filteredRoutes]
  );

  const handleRouteSelect = useCallback((routeId: string | null) => {
    setSelectedRouteId(routeId);
  }, []);

  // ── Panel callbacks ───────────────────────────────────────────────────────
  const handleCampaignSelection = useCallback(
    (
      routeId: string,
      bounds: [[number, number], [number, number]] | null,
      colorMap: Map<string, string>
    ) => {
      setCampaignRouteId(routeId);
      setCampaignBounds(bounds);
      setCampaignColorMap(colorMap);
    },
    []
  );

  const handleFleetSelection = useCallback(
    (
      routeId: string,
      bounds: [[number, number], [number, number]] | null,
      colorMap: Map<string, string>
    ) => {
      setFleetRouteId(routeId);
      setFleetBounds(bounds);
      setFleetColorMap(colorMap);
    },
    []
  );

  const getCampaignRouteColor = useCallback(
    (route: RouteWithShapes, _idx: number): string =>
      campaignColorMap.get(route.routeId) ?? DEFAULT_ROUTE_COLOR,
    [campaignColorMap]
  );

  const getFleetRouteColor = useCallback(
    (route: RouteWithShapes, _idx: number): string =>
      fleetColorMap.get(route.routeId) ?? DEFAULT_ROUTE_COLOR,
    [fleetColorMap]
  );

  // ── Computed map props per active tab ─────────────────────────────────────
  const isNonMapTab =
    activeTab === "campanas-ambientales" || activeTab === "optimizacion-flota";

  const mapSelectedRouteId =
    activeTab === "campanas-ambientales"
      ? campaignRouteId
      : activeTab === "optimizacion-flota"
        ? fleetRouteId
        : selectedRouteId;

  const mapTargetBounds =
    activeTab === "campanas-ambientales"
      ? campaignBounds
      : activeTab === "optimizacion-flota"
        ? fleetBounds
        : null;

  const mapGetRouteColor =
    activeTab === "campanas-ambientales"
      ? getCampaignRouteColor
      : activeTab === "optimizacion-flota"
        ? getFleetRouteColor
        : resolveColor;

  const mapUnselectedOpacity =
    activeTab === "campanas-ambientales"
      ? 0.5
      : activeTab === "optimizacion-flota"
        ? 0.3
        : undefined;

  const mapUnselectedLineWidth =
    activeTab === "campanas-ambientales"
      ? 2
      : activeTab === "optimizacion-flota"
        ? 1
        : undefined;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[calc(100vh-8rem)]">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando rutas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <ErrorState
          title="Error cargando rutas"
          description={error}
          action={
            <Button size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-3">
      {allowedTabs.length > 1 && (
        <MapPageTabs
          activeTab={activeTab}
          allowedTabs={allowedTabs}
          onTabChange={setActiveTab}
        />
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar — width transitions between tabs */}
        <div
          className={cn(
            "flex-shrink-0 flex flex-col bg-background rounded-lg border border-border overflow-hidden min-h-0 transition-[width] duration-300",
            isNonMapTab ? "w-[540px]" : "w-[380px]"
          )}
        >
          {/* Agency filter — always visible, shared across all tabs */}
          <AgencyFilterBar
            agencies={agencies}
            activeAgencyIds={activeAgencyIds}
            onToggle={toggleAgency}
          />

          {/* Map tab: route list + energy calculator */}
          {!isNonMapTab && (
            <SidebarContent
              activeTab={activeTab}
              routes={filteredRoutes}
              selectedRouteId={selectedRouteId}
              onRouteSelect={handleRouteSelect}
              getRouteColor={resolveColor}
            />
          )}

          {/* Campaigns panel */}
          {allowedTabs.includes("campanas-ambientales") &&
            activeTab === "campanas-ambientales" && (
              <CampaignsPanel
                routes={filteredRoutes}
                onSelectionChange={handleCampaignSelection}
              />
            )}

          {/* Fleet optimization panel */}
          {allowedTabs.includes("optimizacion-flota") &&
            activeTab === "optimizacion-flota" && (
              <FleetPanel
                routes={filteredRoutes}
                onSelectionChange={handleFleetSelection}
              />
            )}
        </div>

        {/* Map — always rendered, props switch per active tab */}
        <div className="flex-1 rounded-lg overflow-hidden border border-border min-h-0">
          <MapContainer
            routes={filteredRoutes}
            selectedRouteId={mapSelectedRouteId}
            getRouteColor={mapGetRouteColor}
            visibleAgencyIds={visibleAgencyIds}
            agencies={agencies}
            targetBounds={mapTargetBounds}
            unselectedOpacity={mapUnselectedOpacity}
            unselectedLineWidth={mapUnselectedLineWidth}
          />
        </div>
      </div>
    </div>
  );
}
