import * as turf from "@turf/turf";

export function createSmoothCurve(
  coordinates: [number, number][],
  resolution = 10000
): [number, number][] {
  if (coordinates.length < 3) {
    return coordinates;
  }

  try {
    const line = turf.lineString(coordinates);
    const curved = turf.bezierSpline(line, { resolution });
    return curved.geometry.coordinates as [number, number][];
  } catch {
    return coordinates;
  }
}
