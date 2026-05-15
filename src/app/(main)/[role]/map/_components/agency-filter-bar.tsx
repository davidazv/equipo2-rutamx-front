"use client";

import type { AgencyWithColorsResponse } from "@/lib/api/agencies";
import { DEFAULT_ROUTE_COLOR } from "@/constants/map";
import { cn } from "@/lib/utils";

function getAgencyColor(agency: AgencyWithColorsResponse): string {
  if (agency.agencyColor) return `#${agency.agencyColor}`;
  if (agency.sampleRouteColors?.length) return `#${agency.sampleRouteColors[0]}`;
  return DEFAULT_ROUTE_COLOR;
}

interface AgencyFilterBarProps {
  agencies: AgencyWithColorsResponse[];
  activeAgencyIds: Set<string>;
  onToggle: (agencyId: string) => void;
}

export function AgencyFilterBar({
  agencies,
  activeAgencyIds,
  onToggle,
}: AgencyFilterBarProps) {
  if (agencies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2.5 border-b border-border shrink-0">
      {agencies.map((agency) => {
        const isActive = activeAgencyIds.has(agency.agencyId);
        const color = getAgencyColor(agency);
        return (
          <button
            key={agency.agencyId}
            onClick={() => onToggle(agency.agencyId)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-text-muted hover:border-muted-foreground/40"
            )}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            {agency.agencyName}
          </button>
        );
      })}
    </div>
  );
}
