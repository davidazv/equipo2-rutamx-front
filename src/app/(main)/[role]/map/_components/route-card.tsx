"use client";

import { Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";

interface RouteCardProps {
  color: string;
  shortName: string;
  longName: string;
  distanceKm?: number;
  pointCount?: number;
  isSelected?: boolean;
  onClick: () => void;
}

export function RouteCard({
  color,
  shortName,
  longName,
  distanceKm,
  pointCount,
  isSelected,
  onClick,
}: RouteCardProps) {
  return (
    <button
      onClick={onClick}
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
              {shortName}
            </Badge>
          </div>
          <p className="text-sm font-medium truncate">{longName}</p>
          {(distanceKm !== undefined || pointCount !== undefined) && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {distanceKm !== undefined && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {formatNumber(distanceKm, 1)} km
                </span>
              )}
              {pointCount !== undefined && <span>{pointCount} puntos</span>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
