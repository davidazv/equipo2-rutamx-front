"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import {
  AGENCY_COLOR_INFO,
  DEFAULT_ROUTE_COLOR,
} from "@/constants/agency-colors";

interface MapLegendProps {
  visibleAgencyIds: string[];
}

export function MapLegend({ visibleAgencyIds }: MapLegendProps) {
  const [open, setOpen] = useState(false);

  const agencies =
    visibleAgencyIds.length > 0
      ? visibleAgencyIds
      : Object.keys(AGENCY_COLOR_INFO);

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
            {agencies.map((id) => {
              const info = AGENCY_COLOR_INFO[id];
              if (!info) return null;
              const multi = info.sampleColors && info.sampleColors.length > 1;

              return (
                <div key={id} className="flex items-center gap-2">
                  {multi ? (
                    <div className="flex gap-0.5 flex-shrink-0">
                      {info.sampleColors!.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="h-3 w-8 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: info.fallback ?? DEFAULT_ROUTE_COLOR,
                      }}
                    />
                  )}
                  <span className="text-xs text-foreground">
                    {info.displayName}
                    {info.description && (
                      <span className="text-muted-foreground">
                        {" — "}
                        {info.description}
                      </span>
                    )}
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
