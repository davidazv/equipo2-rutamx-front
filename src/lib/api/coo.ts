import { apiFetch } from "./client";
import type { DashboardAgencyRow } from "./cmo";

export interface OperationalCounters {
  totalRoutes: number;
  totalTrips: number;
  totalStops: number;
  totalShapes: number;
  avgFrequencyMin: number;
}

export interface PassengerTrendRow {
  dow: number;
  avgPassengers: number;
}

export interface HourlyTripRow {
  hour: number;
  tripCount: number;
}

export interface CooDashboardResponse {
  operational: OperationalCounters;
  trend: PassengerTrendRow[];
  hourly: HourlyTripRow[];
  agencies: DashboardAgencyRow[];
}

/**
 * Calls sp_get_coo_dashboard via /api/coo/dashboard.
 * Returns operational counters, passenger trend, hourly trips and agencies in one round-trip.
 */
export async function getCooDashboard(
  start?: string,
  end?: string,
): Promise<CooDashboardResponse> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/api/coo/dashboard${qs}`);
  if (!res.ok) throw new Error("Error obteniendo dashboard COO");
  return res.json();
}
