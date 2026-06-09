import { apiGet } from './client'

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

// ── API functions ──────────────────────────────────────────────────────────

export async function getBusModels(): Promise<BusModelResponse[]> {
  return apiGet<BusModelResponse[]>("/api/bus-models");
}

export async function getRoutes(): Promise<RouteResponse[]> {
  return apiGet<RouteResponse[]>("/api/routes");
}

export async function getRoutesWithShapes(
  agencyId?: string
): Promise<RouteWithShapes[]> {
  const params = agencyId
    ? `?agencyId=${encodeURIComponent(agencyId)}`
    : "";
  return apiGet<RouteWithShapes[]>(`/api/routes/shapes${params}`);
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
  return apiGet<RouteTimeComparison[]>("/api/routes/travel-times");
}

export async function calculateEnergyConsumption(
  routeId: string,
  busModelId: number,
  occupancyPercent: number
): Promise<EnergyConsumptionResponse> {
  return apiGet<EnergyConsumptionResponse>(
    `/api/energy-consumption?routeId=${encodeURIComponent(routeId)}&busModelId=${busModelId}&occupancyPercent=${occupancyPercent}`
  );
}
