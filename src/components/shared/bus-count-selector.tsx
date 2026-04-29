"use client";

import { Bus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
}

export function BusCountSelector({
  value,
  onChange,
  presets = [5, 10, 20, 50],
}: BusCountSelectorProps) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">Buses</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          max={200}
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-xs bg-muted border border-border rounded-md px-2 py-1.5"
        />
        {presets.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "px-2 py-1 text-xs rounded-full border transition-colors flex items-center gap-1",
              value === n
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary"
            )}
          >
            <Bus className="h-3 w-3" />{n}
          </button>
        ))}
      </div>
    </div>
  );
}
