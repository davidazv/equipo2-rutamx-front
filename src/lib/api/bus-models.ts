/**
 * Bus model service — HU08 reads from the real API.
 * Admin CRUD (HU13/14/15) still resolves from in-memory mock data
 * until those HUs connect to the backend.
 */

import { apiFetch } from './client'
import {
  type BusModel,
  type FuelType,
  mockBusModels,
  getNextBusModelId,
} from '@/lib/mock/bus-models'

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

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Read (real API) ───────────────────────────────────────────────────────

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

// ── HU13 – Create bus model (mock) ────────────────────────────────────────

export async function createBusModel(
  input: CreateBusModelInput
): Promise<BusModel> {
  await delay()

  const duplicate = mockBusModels.find(
    (m) =>
      m.name.toLowerCase() === input.name.toLowerCase() &&
      m.manufacturer.toLowerCase() === input.manufacturer.toLowerCase()
  )
  if (duplicate) throw new Error('MODEL_ALREADY_EXISTS')

  const model: BusModel = {
    id: getNextBusModelId(),
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
  }

  mockBusModels.push(model)
  return { ...model }
}

// ── HU14 – Update bus model (mock) ────────────────────────────────────────

export async function updateBusModel(
  id: number,
  input: UpdateBusModelInput
): Promise<BusModel> {
  await delay()

  const idx = mockBusModels.findIndex((m) => m.id === id)
  if (idx === -1) throw new Error('MODEL_NOT_FOUND')

  if (input.name && input.manufacturer) {
    const duplicate = mockBusModels.find(
      (m) =>
        m.name.toLowerCase() === input.name!.toLowerCase() &&
        m.manufacturer.toLowerCase() === input.manufacturer!.toLowerCase() &&
        m.id !== id
    )
    if (duplicate) throw new Error('MODEL_ALREADY_EXISTS')
  }

  const updated: BusModel = {
    ...mockBusModels[idx],
    ...input,
  }

  mockBusModels[idx] = updated
  return { ...updated }
}

// ── HU15 – Delete bus model (mock) ────────────────────────────────────────

export async function deleteBusModel(id: number): Promise<void> {
  await delay()

  const idx = mockBusModels.findIndex((m) => m.id === id)
  if (idx === -1) throw new Error('MODEL_NOT_FOUND')

  mockBusModels.splice(idx, 1)
}
