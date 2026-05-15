const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export interface BusModelResponse {
  id: number;
  name: string;
  manufacturer: string;
  fuelType: "ELECTRIC" | "DIESEL";
  autonomyKm: number;
  passengerCapacity: number;
  unitCostUsd: number;
  batteryCapacityKwh: number;
  energyConsumptionKwhKm: number;
  fuelConsumptionLKm: number;
  maintenanceCostPerKm: number;
  co2EmissionsGKm: number;
}

export interface RouteResponse {
  routeId: string;
  agencyId: string;
  routeShortName: string;
  routeLongName: string;
  routeType: number;
  distanceKm: number;
}

export interface RouteWithShapes {
  routeId: string;
  agencyId: string;
  routeShortName: string;
  routeLongName: string;
  routeType: number;
  routeColor: string | null;
  distanceKm: number;
  coordinates: [number, number][];
}

export interface EnergyConsumptionResponse {
  routeId: string;
  routeDistanceKm: number;
  busModelId: number;
  busModelName: string;
  occupancyPercent: number;
  estimatedConsumptionKwh: number;
  batteryPercentAfter: number;
  remainingRangeKm: number;
  canCompleteRoute: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "Error desconocido");
    throw new Error(text);
  }
  return res.json();
}

// ── API functions ──────────────────────────────────────────────────────────

export async function getBusModels(): Promise<BusModelResponse[]> {
  return apiFetch<BusModelResponse[]>("/api/bus-models");
}

export async function getRoutes(): Promise<RouteResponse[]> {
  return apiFetch<RouteResponse[]>("/api/routes");
}

export async function getRoutesWithShapes(
  agencyId?: string
): Promise<RouteWithShapes[]> {
  const params = agencyId
    ? `?agencyId=${encodeURIComponent(agencyId)}`
    : "";
  return apiFetch<RouteWithShapes[]>(`/api/routes/shapes${params}`);
}

// ── HU19: Route travel time comparison ────────────────────────────────────

export interface RouteTimeComparison {
  routeId: string;
  agencyId: string;
  routeShortName: string;
  routeLongName: string;
  distanceKm: number;
  scheduledTimeMinutes: number;
  estimatedTimeMinutes: number;
  avgSpeedKmH: number;
  variabilityPercent: number;
  frequencyMinutes: number;
}

export async function getRouteTravelTimes(): Promise<RouteTimeComparison[]> {
  return apiFetch<RouteTimeComparison[]>("/api/routes/travel-times");
}

export async function calculateEnergyConsumption(
  routeId: string,
  busModelId: number,
  occupancyPercent: number
): Promise<EnergyConsumptionResponse> {
  return apiFetch<EnergyConsumptionResponse>(
    `/api/energy-consumption?routeId=${encodeURIComponent(routeId)}&busModelId=${busModelId}&occupancyPercent=${occupancyPercent}`
  );
}
