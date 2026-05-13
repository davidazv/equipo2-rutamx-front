const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ComparativeReportResponse {
  routeId: string;
  routeDistanceKm: number;
  numberOfBuses: number;
  electricModelName: string;
  electricCostPerYear: number;
  electricMaintenanceCostPerYear: number;
  electricTotalCostPerYear: number;
  electricCo2TonsPerYear: number;
  dieselModelName: string;
  dieselCostPerYear: number;
  dieselMaintenanceCostPerYear: number;
  dieselTotalCostPerYear: number;
  dieselCo2TonsPerYear: number;
  annualSavingsMXN: number;
  co2AvoidedTonsPerYear: number;
  savingsPercent: number;
}

export type { BusModelResponse, RouteResponse } from "@/lib/api/roi";

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

export async function getComparativeReport(
  routeId: string,
  electricModelId: number,
  dieselModelId: number,
  buses: number
): Promise<ComparativeReportResponse> {
  return apiFetch<ComparativeReportResponse>(
    `/api/reports/comparative?routeId=${encodeURIComponent(routeId)}&electricModelId=${electricModelId}&dieselModelId=${dieselModelId}&buses=${buses}`
  );
}
