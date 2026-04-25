"use client";

import { useState, useCallback } from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import type { ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MEXICO_CITY_CENTER, DEFAULT_ZOOM } from "@/constants/agencies";
import type { RouteWithShapes } from "@/lib/api/energy";
import { createSmoothCurve } from "@/lib/map/smooth-curves";
import { MapLegend } from "./map-legend";

interface MapInnerProps {
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  mapboxToken: string;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  visibleAgencyIds: string[];
}

export function MapInner({
  routes,
  selectedRouteId,
  mapboxToken,
  getRouteColor,
  visibleAgencyIds,
}: MapInnerProps) {
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: MEXICO_CITY_CENTER[0],
    latitude: MEXICO_CITY_CENTER[1],
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0,
  });

  const handleMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapLegend visibleAgencyIds={visibleAgencyIds} />
      <Map
        {...viewState}
        onMove={handleMove}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {routes.map((route, idx) => {
        const color = getRouteColor(route, idx);
        const smoothCoords =
          route.coordinates.length >= 3
            ? createSmoothCurve(route.coordinates)
            : route.coordinates;
        const isSelected = selectedRouteId === route.routeId;
        const opacity = selectedRouteId ? (isSelected ? 1 : 0.15) : 0.8;

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
                "line-color": color,
                "line-width": isSelected ? 12 : 8,
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
                "line-color": color,
                "line-width": isSelected ? 4 : 3,
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
      </Map>
    </div>
  );
}
