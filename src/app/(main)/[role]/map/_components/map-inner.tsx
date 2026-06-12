"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Map, { Source, Layer, NavigationControl, type MapRef, type ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MEXICO_CITY_CENTER, DEFAULT_ZOOM } from "@/constants/map";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { createSmoothCurve } from "@/lib/map/smooth-curves";
import { varyColor, blendWithWhite } from "@/lib/map/color-utils";
import { MapLegend } from "./map-legend";

interface MapInnerProps {
  readonly routes: RouteWithShapes[];
  readonly selectedRouteId: string | null;
  readonly mapboxToken: string;
  readonly getRouteColor: (route: RouteWithShapes, index: number) => string;
  readonly visibleAgencyIds: string[];
  readonly agencies: AgencyWithColorsResponse[];
  readonly targetBounds?: [[number, number], [number, number]] | null;
  readonly unselectedOpacity?: number;
  readonly unselectedLineWidth?: number;
}

export function MapInner({
  routes,
  selectedRouteId,
  mapboxToken,
  getRouteColor,
  visibleAgencyIds,
  agencies,
  targetBounds,
  unselectedOpacity = 0.08,
  unselectedLineWidth = 3,
}: MapInnerProps) {
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: MEXICO_CITY_CENTER[0],
    latitude: MEXICO_CITY_CENTER[1],
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0,
  });

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (!targetBounds || !mapRef.current) return;
    mapRef.current.fitBounds(targetBounds, { padding: 80, duration: 1200 });
  }, [targetBounds]);

  const handleMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapLegend visibleAgencyIds={visibleAgencyIds} agencies={agencies} />
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {/* Render non-selected routes first, selected route last so it appears on top */}
        {routes.map((route, idx) => {
        if (selectedRouteId && route.routeId === selectedRouteId) return null;
        const baseColor = getRouteColor(route, idx);
        const smoothCoords =
          route.coordinates.length >= 3
            ? createSmoothCurve(route.coordinates)
            : route.coordinates;
        const normalizedBase = baseColor.startsWith("#") ? baseColor : `#${baseColor}`;
        const displayColor = selectedRouteId
          ? normalizedBase
          : varyColor(normalizedBase, route.routeId);
        const opacity = selectedRouteId ? unselectedOpacity : 0.8;
        const lineWidth = selectedRouteId ? unselectedLineWidth : 3;

        return (
          <Source
            key={route.routeId}
            id={`route-${route.routeId}`}
            type="geojson"
            data={{
              type: "Feature",
              properties: { id: route.routeId },
              geometry: {
                type: "LineString",
                coordinates: smoothCoords,
              },
            }}
          >
            <Layer
              id={`route-${route.routeId}-glow`}
              type="line"
              paint={{
                "line-color": displayColor,
                "line-width": lineWidth * 2.5,
                "line-opacity": opacity * 0.4,
                "line-blur": 3,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
            <Layer
              id={`route-${route.routeId}-line`}
              type="line"
              paint={{
                "line-color": displayColor,
                "line-width": lineWidth,
                "line-opacity": opacity,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        );
      })}

        {/* Selected route rendered last for z-index priority */}
        {selectedRouteId && routes.map((route, idx) => {
        if (route.routeId !== selectedRouteId) return null;
        const baseColor = getRouteColor(route, idx);
        const smoothCoords =
          route.coordinates.length >= 3
            ? createSmoothCurve(route.coordinates)
            : route.coordinates;

        return (
          <Source
            key={route.routeId}
            id={`route-${route.routeId}`}
            type="geojson"
            data={{
              type: "Feature",
              properties: { id: route.routeId },
              geometry: {
                type: "LineString",
                coordinates: smoothCoords,
              },
            }}
          >
            <Layer
              id={`route-${route.routeId}-glow`}
              type="line"
              paint={{
                "line-color": blendWithWhite(baseColor, 0.5),
                "line-width": 11.2,
                "line-opacity": 0.4,
                "line-blur": 4.8,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
            <Layer
              id={`route-${route.routeId}-line`}
              type="line"
              paint={{
                "line-color": blendWithWhite(baseColor, 0.7),
                "line-width": 4,
                "line-opacity": 1,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        );
      })}
      </Map>
    </div>
  );
}
