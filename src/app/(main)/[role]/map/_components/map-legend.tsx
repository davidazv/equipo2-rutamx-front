"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { DEFAULT_ROUTE_COLOR } from "@/constants/map";
import { ensureContrast } from "@/lib/map/color-utils";

function getAgencyDisplayColor(agency: AgencyWithColorsResponse): string {
  if (agency.agencyColor) return `#${agency.agencyColor}`;
  if (agency.sampleRouteColors?.length) return `#${agency.sampleRouteColors[0]}`;
  return DEFAULT_ROUTE_COLOR;
}

interface MapLegendProps {
  readonly visibleAgencyIds: string[];
  readonly agencies: AgencyWithColorsResponse[];
}

export function MapLegend({ visibleAgencyIds, agencies }: MapLegendProps) {
  const [open, setOpen] = useState(false);

  const visible =
    visibleAgencyIds.length > 0
      ? agencies.filter((a) => visibleAgencyIds.includes(a.agencyId))
      : agencies;

  return (
    <div className="absolute top-3 left-3 z-10">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-background/90 border border-border shadow-md backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Mostrar leyenda de colores"
        >
          <Info className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[220px] max-w-[280px]"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-foreground">
              Leyenda de colores
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Cerrar leyenda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {visible.map((agency) => {
              const colors = agency.sampleRouteColors ?? [];
              const fallback = ensureContrast(getAgencyDisplayColor(agency));

              return (
                <div key={agency.agencyId} className="flex items-center gap-2">
                  {agency.multiColor && colors.length > 1 ? (
                    <div className="flex gap-0.5 flex-shrink-0">
                      {colors.slice(0, 4).map((c, i) => (
                        <div
                          key={`${c}-${i}`}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: ensureContrast(`#${c}`) }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="h-3 w-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fallback }}
                    />
                  )}
                  <span className="text-xs text-foreground">
                    {agency.agencyName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
