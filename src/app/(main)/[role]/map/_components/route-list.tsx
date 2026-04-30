"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RouteWithShapes } from "@/lib/api/energy";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { DEFAULT_ROUTE_COLOR } from "@/constants/map";
import { varyColor, ensureContrast } from "@/lib/map/color-utils";
import { RouteCard } from "./route-card";

function getAgencyDisplayColor(agency: AgencyWithColorsResponse): string {
  if (agency.agencyColor) return `#${agency.agencyColor}`;
  if (agency.sampleRouteColors?.length) return `#${agency.sampleRouteColors[0]}`;
  return DEFAULT_ROUTE_COLOR;
}

interface RouteListProps {
  routes: RouteWithShapes[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string | null) => void;
  onConfirm: (routeId: string) => void;
  getRouteColor: (route: RouteWithShapes, index: number) => string;
  agencies: AgencyWithColorsResponse[];
  selectedAgencyId: string | null;
  onAgencyChange: (agencyId: string) => void;
}

export function RouteList({
  routes,
  selectedRouteId,
  onRouteSelect,
  onConfirm,
  getRouteColor,
  agencies,
  selectedAgencyId,
  onAgencyChange,
}: RouteListProps) {
  const [search, setSearch] = useState("");

  const filteredRoutes = routes.filter(
    (route) =>
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
                              style={{
                                backgroundColor: ensureContrast(`#${c}`),
                              }}
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
