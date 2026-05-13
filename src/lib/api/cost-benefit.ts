const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CostBenefitPoint {
  year: number;
  electricCumulativeMXN: number;
  dieselCumulativeMXN: number;
  breakEvenYear: boolean;
}

export interface CostBenefitReportResponse {
  routeId: string;
  routeDistanceKm: number;
  numberOfBuses: number;
  electricModelName: string;
  dieselModelName: string;
  totalInvestmentMXN: number;
  paybackYears: number;
  points: CostBenefitPoint[];
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

export async function getCostBenefitReport(
  routeId: string,
  electricModelId: number,
  dieselModelId: number,
  buses: number,
  years: number
): Promise<CostBenefitReportResponse> {
  return apiFetch<CostBenefitReportResponse>(
    `/api/reports/cost-benefit?routeId=${encodeURIComponent(routeId)}&electricModelId=${electricModelId}&dieselModelId=${dieselModelId}&buses=${buses}&years=${years}`
  );
}
