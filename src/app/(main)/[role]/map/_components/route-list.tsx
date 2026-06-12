"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RouteWithShapes } from "@/lib/api/energy";
import { varyColor, ensureContrast } from "@/lib/map/color-utils";
import { RouteCard } from "./route-card";

interface RouteListProps {
  readonly routes: RouteWithShapes[];
  readonly selectedRouteId: string | null;
  readonly onRouteSelect: (routeId: string | null) => void;
  readonly onConfirm: (routeId: string) => void;
  readonly getRouteColor: (route: RouteWithShapes, index: number) => string;
}

export function RouteList({
  routes,
  selectedRouteId,
  onRouteSelect,
  onConfirm,
  getRouteColor,
}: RouteListProps) {
  const [search, setSearch] = useState("");

  const filteredRoutes = routes.filter(
    (route) =>
      route.routeLongName.toLowerCase().includes(search.toLowerCase()) ||
      route.routeShortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar rutas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRoutes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No se encontraron rutas
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredRoutes.map((route, idx) => {
              const isSelected = selectedRouteId === route.routeId;
              const baseColor = getRouteColor(route, idx);
              const color = ensureContrast(varyColor(baseColor, route.routeId));

              return (
                <RouteCard
                  key={route.routeId}
                  color={color}
                  shortName={route.routeShortName}
                  longName={route.routeLongName}
                  distanceKm={route.distanceKm}
                  pointCount={route.coordinates.length}
                  isSelected={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      onConfirm(route.routeId);
                    } else {
                      onRouteSelect(route.routeId);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {selectedRouteId && (
        <div className="flex-shrink-0 p-3 border-t border-border">
          <Button
            className="w-full gap-2"
            onClick={() => onConfirm(selectedRouteId)}
          >
            Ver detalle
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
