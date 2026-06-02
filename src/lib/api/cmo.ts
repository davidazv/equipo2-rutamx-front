import { apiFetch } from "./client";

export interface RouteStatsResponse {
  routeId: string;
  routeName: string;
  agencyId: string;
  agencyColor: string | null;
  distanciaKm: number;
  avgDailyPassengers: number;
  co2DieselTonAnio: number;
  co2ElectricoTonAnio: number;
  co2AhorradoTonAnio: number;
  avgDailyTrips: number;
  headwayMinutes: number;
}

/** @deprecated Use getCmoDashboard() that bundles routes + agencies in one call (sp_get_cmo_dashboard). */
export async function getRouteStats(): Promise<RouteStatsResponse[]> {
  const res = await apiFetch("/api/cmo/route-stats");
  if (!res.ok) throw new Error("Error obteniendo estadísticas por ruta");
  return res.json();
}

export interface CmoDashboardRouteRow {
  routeId: string;
  routeShortName: string | null;
  routeLongName: string | null;
  agencyId: string;
  routeColor: string | null;
  distanciaKm: number;
  totalTrips: number;
  avgDailyTrips: number;
  headwayMinutes: number;
  annualKm: number;
  co2DieselTonAnio: number;
  co2ElectricTonAnio: number;
}

export interface DashboardAgencyRow {
  agencyId: string;
  agencyName: string;
}

export interface CmoDashboardResponse {
  routes: CmoDashboardRouteRow[];
  agencies: DashboardAgencyRow[];
}

/**
 * Calls sp_get_cmo_dashboard via /api/cmo/dashboard.
 * Returns routes + agencies in a single round-trip.
 */
export async function getCmoDashboard(agencyId?: string): Promise<CmoDashboardResponse> {
  const qs = agencyId ? `?agencyId=${encodeURIComponent(agencyId)}` : "";
  const res = await apiFetch(`/api/cmo/dashboard${qs}`);
  if (!res.ok) throw new Error("Error obteniendo dashboard CMO");
  return res.json();
}
