import { apiFetch } from "./client";

export interface OperationalSummaryResponse {
  totalRoutes: number;
  avgDailyPassengers: number;
  peakHour: string;
}

export interface PassengerTrendPoint {
  day: string;
  avgPassengers: number;
}

export interface HourlyOccupancy {
  hour: number;
  occupancyPct: number;
}

export interface HourlyBusDemand {
  hour: number;
  busesRequired: number;
}

export interface HourlyStatsResponse {
  occupancyByHour: HourlyOccupancy[];
  busDemand: HourlyBusDemand[];
}

export async function getOperationalSummary(): Promise<OperationalSummaryResponse> {
  const res = await apiFetch("/api/kpi/operational-summary");
  if (!res.ok) throw new Error("Error obteniendo resumen operacional");
  return res.json();
}

export async function getPassengerTrend(): Promise<PassengerTrendPoint[]> {
  const res = await apiFetch("/api/kpi/passenger-trend");
  if (!res.ok) throw new Error("Error obteniendo tendencia de pasajeros");
  return res.json();
}

export async function getHourlyStats(): Promise<HourlyStatsResponse> {
  const res = await apiFetch("/api/kpi/hourly-stats");
  if (!res.ok) throw new Error("Error obteniendo estadísticas por hora");
  return res.json();
}
