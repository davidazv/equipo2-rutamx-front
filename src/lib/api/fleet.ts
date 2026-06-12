import { apiFetch } from './client'
import { throwResponseError } from './http-error'

// ── HU12 — Bus model recommendation ──────────────────────────────────────

export type DayType = "weekday" | "saturday" | "sunday";

export interface BusModelDetail {
  id: number;
  name: string;
  manufacturer: string;
  fuelType: string;
  autonomyKm: number;
  passengerCapacity: number;
  unitCostUsd: number;
  batteryCapacityKwh: number;
  energyConsumptionKwhKm: number;
  fuelConsumptionLKm: number;
  maintenanceCostPerKm: number;
  co2EmissionsGKm: number;
}

export interface BusModelRank {
  rank: number;
  model: BusModelDetail;
  meetsCapacity: boolean;
  meetsAutonomy: boolean;
  recommended: boolean;
  requiredCapacity: number;
  justification: string;
}

export interface DayRecommendation {
  peakHourDemand: number;
  requiredCapacity: number;
  models: BusModelRank[];
}

export interface BusModelRecommendation {
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  distanceKm: number;
  frequencyMinutes: number;
  demand: {
    avgWeekday: number;
    avgSaturday: number;
    avgSunday: number;
  };
  recommendations: {
    weekday: DayRecommendation;
    saturday: DayRecommendation;
    sunday: DayRecommendation;
  };
}

export async function getBusModelRecommendation(
  routeId: string,
  targetOccupancy: number,
): Promise<BusModelRecommendation> {
  const occ = (targetOccupancy / 100).toFixed(2);
  const res = await apiFetch(
    `/api/routes/${encodeURIComponent(routeId)}/bus-model-recommendation?targetOccupancy=${occ}`
  );
  if (!res.ok) {
    await throwResponseError(res);
  }
  return res.json();
}
