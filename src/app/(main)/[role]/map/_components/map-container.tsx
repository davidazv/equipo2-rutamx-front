"use client";

import { useState, useEffect } from "react";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { Spinner } from "@/components/ui/spinner";

interface MapContainerProps {
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  visibleAgencyIds: string[];
  agencies: AgencyWithColorsResponse[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapInnerProps {
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  mapboxToken: string;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  visibleAgencyIds: string[];
  agencies: AgencyWithColorsResponse[];
}

export function MapContainer({
  routes,
  selectedRouteId,
  getRouteColor,
  visibleAgencyIds,
  agencies,
}: MapContainerProps) {
  const [MapComponent, setMapComponent] =
    useState<React.ComponentType<MapInnerProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("./map-inner").then((mod) => {
      setMapComponent(() => mod.MapInner);
      setIsLoading(false);
    });
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background rounded-lg">
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-2">Mapbox Token Required</p>
          <p className="text-sm text-muted-foreground">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !MapComponent) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background rounded-lg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <MapComponent
      routes={routes}
      selectedRouteId={selectedRouteId}
      mapboxToken={MAPBOX_TOKEN}
      getRouteColor={getRouteColor}
      visibleAgencyIds={visibleAgencyIds}
      agencies={agencies}
    />
  );
}
