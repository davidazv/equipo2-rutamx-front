import { apiGet } from './client'

// ── Types ──────────────────────────────────────────────────────────────────

export interface FuelSavingsResponse {
  routeId: string;
  routeDistanceKm: number;
  busModelId: number;
  busModelName: string;
  numberOfBuses: number;
  fuelSavingsMXN: number;
  fuelSavingsLiters: number;
  dieselReferencePriceMXN: number;
  dieselConsumptionLKm: number;
  dieselCostPerYear: number;
  electricCostPerYear: number;
  projectionYears: number;
}

// ── API functions ──────────────────────────────────────────────────────────

export async function getFuelSavings(
  routeId: string,
  modelId: number,
  buses: number,
  years = 5
): Promise<FuelSavingsResponse> {
  return apiGet<FuelSavingsResponse>(
    `/api/fuel-savings?routeId=${encodeURIComponent(routeId)}&modelId=${modelId}&buses=${buses}&years=${years}`
  );
}
