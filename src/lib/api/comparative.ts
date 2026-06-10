import { apiFetch } from './client'
import { throwResponseError } from './http-error'

export interface TcoDataPoint {
  year: number
  electricTCO: number
  dieselTCO: number
}

export interface ComparativeReportResponse {
  routeId: string
  routeName: string
  distanceKm: number
  numberOfBuses: number
  projectionYears: number
  electricModelName: string
  dieselModelName: string
  electricCostPerYear: number
  dieselCostPerYear: number
  electricMaintenancePerYear: number
  dieselMaintenancePerYear: number
  co2AvoidedTonsPerYear: number
  totalInvestmentMXN: number
  netAnnualSavings: number
  roiPercent: number
  paybackYears: number
  tcoProjection: TcoDataPoint[]
  paybackYear: number
}

export interface ComparativeReportParams {
  routeId: string
  electricModelId: number
  dieselModelId: number
  buses: number
  years: number
}

export async function getComparativeReport(
  params: ComparativeReportParams
): Promise<ComparativeReportResponse> {
  const query = new URLSearchParams({
    routeId: params.routeId,
    electricModelId: String(params.electricModelId),
    dieselModelId: String(params.dieselModelId),
    buses: String(params.buses),
    years: String(params.years),
  })

  const res = await apiFetch(`/api/reports/comparative?${query}`)

  if (!res.ok) {
    await throwResponseError(res)
  }

  return res.json()
}
