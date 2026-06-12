export const BUS_MODEL_PALETTE = [
  { hex: "#3b82f6", bar: "rgba(59, 130, 246, 0.75)",  fill: "rgba(59, 130, 246, 0.12)"  }, // blue
  { hex: "#22c55e", bar: "rgba(34, 197, 94, 0.75)",   fill: "rgba(34, 197, 94, 0.12)"   }, // green
  { hex: "#f97316", bar: "rgba(249, 115, 22, 0.75)",  fill: "rgba(249, 115, 22, 0.12)"  }, // orange
  { hex: "#a855f7", bar: "rgba(168, 85, 247, 0.75)",  fill: "rgba(168, 85, 247, 0.12)"  }, // purple
  { hex: "#ef4444", bar: "rgba(239, 68, 68, 0.75)",   fill: "rgba(239, 68, 68, 0.12)"   }, // red
  { hex: "#14b8a6", bar: "rgba(20, 184, 166, 0.75)",  fill: "rgba(20, 184, 166, 0.12)"  }, // teal
  { hex: "#eab308", bar: "rgba(234, 179, 8, 0.75)",   fill: "rgba(234, 179, 8, 0.12)"   }, // yellow
  { hex: "#ec4899", bar: "rgba(236, 72, 153, 0.75)",  fill: "rgba(236, 72, 153, 0.12)"  }, // pink
] as const;

export type BusModelColor = typeof BUS_MODEL_PALETTE[number];

export function getBusModelColor(index: number): BusModelColor {
  return BUS_MODEL_PALETTE[index % BUS_MODEL_PALETTE.length];
}

/** Builds a stable map from model ID → color, based on original order. */
export function buildColorMap(modelIds: number[]): Map<number, BusModelColor> {
  const map = new Map<number, BusModelColor>();
  modelIds.forEach((id, i) => map.set(id, getBusModelColor(i)));
  return map;
}
