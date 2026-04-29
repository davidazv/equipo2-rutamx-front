"use client";

import { useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BusModelResponse, RouteResponse } from "@/lib/api/roi";

const QUICK_BUSES = [5, 10, 20, 50];
const MAX_ROUTES = 4;

interface FilterBarProps {
  routes: RouteResponse[];
  busModels: BusModelResponse[];
  selectedRoutes: string[];
  selectedModel: number | null;
  buses: number;
  onRoutesChange: (routes: string[]) => void;
  onModelChange: (modelId: number) => void;
  onBusesChange: (buses: number) => void;
}

export function FilterBar({
  routes,
  busModels,
  selectedRoutes,
  selectedModel,
  buses,
  onRoutesChange,
  onModelChange,
  onBusesChange,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function toggleRoute(routeId: string) {
    if (selectedRoutes.includes(routeId)) {
      if (selectedRoutes.length > 1) {
        onRoutesChange(selectedRoutes.filter((r) => r !== routeId));
      }
    } else if (selectedRoutes.length < MAX_ROUTES) {
      onRoutesChange([...selectedRoutes, routeId]);
    }
  }

  function removeRoute(routeId: string) {
    if (selectedRoutes.length > 1) {
      onRoutesChange(selectedRoutes.filter((r) => r !== routeId));
    }
  }

  const routeMap = new Map(routes.map((r) => [r.routeId, r]));

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Route multi-select */}
        <div className="flex-1 min-w-[200px]" ref={dropdownRef}>
          <label className="text-xs text-muted-foreground block mb-1">
            Rutas
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex w-full items-center gap-1 flex-wrap min-h-[34px] bg-muted border border-border rounded-md px-2 py-1 text-left"
            >
              {selectedRoutes.map((id) => {
                const r = routeMap.get(id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-xs"
                  >
                    {r?.routeShortName ?? id}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoute(id);
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            </button>

            {open && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                  {routes.map((r) => {
                    const selected = selectedRoutes.includes(r.routeId);
                    const disabled =
                      !selected && selectedRoutes.length >= MAX_ROUTES;
                    return (
                      <button
                        key={r.routeId}
                        type="button"
                        onClick={() => toggleRoute(r.routeId)}
                        disabled={disabled}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors",
                          disabled && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0",
                            selected
                              ? "bg-primary border-primary text-white"
                              : "border-border"
                          )}
                        >
                          {selected && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-2.5 w-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">
                          {r.routeShortName} — {r.routeLongName?.slice(0, 35)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bus model */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Modelo
          </label>
          <select
            value={selectedModel ?? ""}
            onChange={(e) => onModelChange(Number(e.target.value))}
            className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 min-w-[140px]"
          >
            {busModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.manufacturer} {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bus count */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Buses
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={200}
              value={buses}
              onChange={(e) =>
                onBusesChange(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 text-xs bg-muted border border-border rounded-md px-2 py-1.5"
            />
            {QUICK_BUSES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onBusesChange(n)}
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full border transition-colors",
                  buses === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
