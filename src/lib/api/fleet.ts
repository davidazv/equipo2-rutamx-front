const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface BusCountResponse {
  linea: string;
  dayType: string;
  avgDailyDemand: number;
  peakHourDemand: number;
  recommendedBuses: number;
  targetOccupancy: number;
}

export interface ModelCandidateResponse {
  id: number;
  name: string;
  manufacturer: string;
  passengerCapacity: number;
  autonomyKm: number;
  unitCostUsd: number;
  recommended: boolean;
}

export interface ModelRecommendationResponse {
  linea: string;
  requiredCapacity: number;
  models: ModelCandidateResponse[];
}

export type DayType = "weekday" | "saturday" | "sunday";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "Error desconocido");
    throw new Error(text);
  }
  return res.json();
}

export async function getBusCount(
  linea: string,
  dayType?: DayType,
  occupancy?: number,
): Promise<BusCountResponse> {
  const params = new URLSearchParams({ linea });
  if (dayType) params.set("dayType", dayType);
  if (occupancy !== undefined) params.set("occupancy", String(occupancy));
  return apiFetch<BusCountResponse>(`/api/fleet/bus-count?${params}`);
}

export async function getModelRecommendation(
  linea: string,
  dayType?: DayType,
  occupancy?: number,
): Promise<ModelRecommendationResponse> {
  const params = new URLSearchParams({ linea });
  if (dayType) params.set("dayType", dayType);
  if (occupancy !== undefined) params.set("occupancy", String(occupancy));
  return apiFetch<ModelRecommendationResponse>(
    `/api/fleet/model-recommendation?${params}`,
  );
}
