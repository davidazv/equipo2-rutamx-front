const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

export async function getFuelSavings(
  routeId: string,
  modelId: number,
  buses: number,
  years = 5
): Promise<FuelSavingsResponse> {
  return apiFetch<FuelSavingsResponse>(
    `/api/fuel-savings?routeId=${encodeURIComponent(routeId)}&modelId=${modelId}&buses=${buses}&years=${years}`
  );
}
