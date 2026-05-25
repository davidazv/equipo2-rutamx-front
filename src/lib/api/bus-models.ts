/**
 * Bus model service — all operations use the real API.
 */

import { apiFetch } from './client'
import { type BusModel, type FuelType } from '@/lib/mock/bus-models'

export type { BusModel, FuelType }

export interface CreateBusModelInput {
  name: string
  manufacturer: string
  fuelType: FuelType
  autonomyKm: number
  passengerCapacity: number
  unitCostUsd: number
  batteryCapacityKwh: number
  energyConsumptionKwhKm?: number
  fuelConsumptionLKm?: number
  maintenanceCostPerKm?: number
  co2EmissionsGKm?: number
}

export interface UpdateBusModelInput {
  name?: string
  manufacturer?: string
  fuelType?: FuelType
  autonomyKm?: number
  passengerCapacity?: number
  unitCostUsd?: number
  batteryCapacityKwh?: number
  energyConsumptionKwhKm?: number
  fuelConsumptionLKm?: number
  maintenanceCostPerKm?: number
  co2EmissionsGKm?: number
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getBusModels(): Promise<BusModel[]> {
  const res = await apiFetch('/api/bus-models')
  if (!res.ok) throw new Error(`Failed to fetch bus models: ${res.status}`)
  return res.json()
}

export async function getBusModelById(id: number): Promise<BusModel> {
  const res = await apiFetch(`/api/bus-models/${id}`)
  if (!res.ok) throw new Error(`Bus model not found: ${res.status}`)
  return res.json()
}

// ── HU13 – Create bus model ────────────────────────────────────────────────

export async function createBusModel(
  input: CreateBusModelInput
): Promise<BusModel> {
  const res = await apiFetch('/api/bus-models', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      manufacturer: input.manufacturer,
      fuelType: input.fuelType,
      autonomyKm: input.autonomyKm,
      passengerCapacity: input.passengerCapacity,
      unitCostUsd: input.unitCostUsd,
      batteryCapacityKwh: input.batteryCapacityKwh,
      energyConsumptionKwhKm: input.energyConsumptionKwhKm ?? null,
      fuelConsumptionLKm: input.fuelConsumptionLKm ?? null,
      maintenanceCostPerKm: input.maintenanceCostPerKm ?? null,
      co2EmissionsGKm: input.co2EmissionsGKm ?? null,
    }),
  })
  if (res.status === 409) throw new Error('MODEL_ALREADY_EXISTS')
  if (!res.ok) throw new Error('CREATE_FAILED')
  return res.json()
}

// ── HU14 – Update bus model ────────────────────────────────────────────────

export async function updateBusModel(
  id: number,
  input: UpdateBusModelInput
): Promise<BusModel> {
  const current = await getBusModelById(id)

  const res = await apiFetch(`/api/bus-models/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.name ?? current.name,
      manufacturer: input.manufacturer ?? current.manufacturer,
      fuelType: input.fuelType ?? current.fuelType,
      autonomyKm: input.autonomyKm ?? current.autonomyKm,
      passengerCapacity: input.passengerCapacity ?? current.passengerCapacity,
      unitCostUsd: input.unitCostUsd ?? current.unitCostUsd,
      batteryCapacityKwh: input.batteryCapacityKwh ?? current.batteryCapacityKwh,
      energyConsumptionKwhKm: input.energyConsumptionKwhKm ?? current.energyConsumptionKwhKm,
      fuelConsumptionLKm: input.fuelConsumptionLKm ?? current.fuelConsumptionLKm,
      maintenanceCostPerKm: input.maintenanceCostPerKm ?? current.maintenanceCostPerKm,
      co2EmissionsGKm: input.co2EmissionsGKm ?? current.co2EmissionsGKm,
    }),
  })
  if (res.status === 404) throw new Error('MODEL_NOT_FOUND')
  if (res.status === 409) throw new Error('MODEL_ALREADY_EXISTS')
  if (!res.ok) throw new Error('UPDATE_FAILED')
  return res.json()
}

// ── HU15 – Delete bus model ────────────────────────────────────────────────

export async function deleteBusModel(id: number): Promise<void> {
  const res = await apiFetch(`/api/bus-models/${id}`, { method: 'DELETE' })
  if (res.status === 404) throw new Error('MODEL_NOT_FOUND')
  if (!res.ok) throw new Error('DELETE_FAILED')
}
