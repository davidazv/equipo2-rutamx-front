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

export async function getRouteStats(): Promise<RouteStatsResponse[]> {
  const res = await apiFetch("/api/cmo/route-stats");
  if (!res.ok) throw new Error("Error obteniendo estadísticas por ruta");
  return res.json();
}
