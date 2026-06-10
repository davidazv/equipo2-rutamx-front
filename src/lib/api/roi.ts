import { throwResponseError } from "./http-error";

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

export interface RoiEstimateResponse {
  roiPercent: number;
  paybackYears: number;
  netAnnualReturn: number;
  totalInvestmentMXN: number;
  co2AvoidedTons: number;
  electricCostPerYear: number;
  dieselCostPerYear: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    await throwResponseError(res);
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

export interface KpiMetricsResponse {
  totalFuelSavingsMXN: number;
  totalCo2AvoidedTons: number;
  totalInvestmentMXN: number;
  totalElectricCostMXN: number;
  totalDieselCostMXN: number;
  routesAnalyzed: number;
}

export async function estimateRoi(
  routeId: string,
  modelId: number,
  buses: number
): Promise<RoiEstimateResponse> {
  return apiFetch<RoiEstimateResponse>(
    `/api/roi/estimate?routeId=${encodeURIComponent(routeId)}&modelId=${modelId}&buses=${buses}`
  );
}

export async function getKpiMetrics(busesPerRoute = 10): Promise<KpiMetricsResponse> {
  return apiFetch<KpiMetricsResponse>(`/api/kpi/summary?busesPerRoute=${busesPerRoute}`);
}
