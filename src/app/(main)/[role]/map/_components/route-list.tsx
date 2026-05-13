"use client";

import { useState } from "react";
import { Search, Ruler } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatNumber } from "@/lib/utils";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { DEFAULT_ROUTE_COLOR } from "@/constants/map";
import { varyColor, ensureContrast } from "@/lib/map/color-utils";

function getAgencyDisplayColor(agency: AgencyWithColorsResponse): string {
  if (agency.agencyColor) return `#${agency.agencyColor}`;
  if (agency.sampleRouteColors?.length) return `#${agency.sampleRouteColors[0]}`;
  return DEFAULT_ROUTE_COLOR;
}

interface RouteListProps {
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string | null) => void;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  agencies: AgencyWithColorsResponse[];
  selectedAgencyId: string | null;
  onAgencyChange: (agencyId: string) => void;
}

export function RouteList({
  routes,
  selectedRouteId,
  onRouteSelect,
  getRouteColor,
  agencies,
  selectedAgencyId,
  onAgencyChange,
}: RouteListProps) {
  const [search, setSearch] = useState("");

  const filteredRoutes = routes.filter((route) =>
    route.routeLongName.toLowerCase().includes(search.toLowerCase()) ||
    route.routeShortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b border-border space-y-3">
        {agencies.length > 0 && (
          <Select
            value={selectedAgencyId ?? ""}
            onValueChange={onAgencyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de transporte" />
            </SelectTrigger>
            <SelectContent>
              {agencies.map((agency) => {
                const colors = agency.sampleRouteColors ?? [];
                const fallback = ensureContrast(getAgencyDisplayColor(agency));

                return (
                  <SelectItem key={agency.agencyId} value={agency.agencyId}>
                    <span className="flex items-center gap-2">
                      {agency.multiColor && colors.length > 1 ? (
                        <span className="flex gap-0.5 flex-shrink-0">
                          {colors.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: ensureContrast(`#${c}`) }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: fallback }}
                        />
                      )}
                      {agency.agencyName}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
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
                <button
                  key={route.routeId}
                  onClick={() =>
                    onRouteSelect(isSelected ? null : route.routeId)
                  }
                  className={cn(
                    "w-full p-4 text-left transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-3 w-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: color, color }}
                        >
                          {route.routeShortName}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {route.routeLongName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {formatNumber(route.distanceKm, 1)} km
                        </span>
                        <span>{route.coordinates.length} puntos</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
