/**
 * Bus model service — all functions are typed for the real API shape.
 * Currently resolves from in-memory mock data. Replace the body of
 * each function with a real fetch() call when the backend is ready.
 */

import {
  BusModel,
  FuelType,
  mockBusModels,
  getNextBusModelId,
} from '@/lib/mock/bus-models'

export type { BusModel, FuelType }

export interface CreateBusModelInput {
  name: string
  manufacturer: string
  fuel_type: FuelType
  autonomy_km: number
  passenger_capacity: number
  unit_cost_usd: number
  battery_capacity_kwh: number
  charge_time_hours: number
  max_speed_kmh: number
}

export interface UpdateBusModelInput {
  name?: string
  manufacturer?: string
  fuel_type?: FuelType
  autonomy_km?: number
  passenger_capacity?: number
  unit_cost_usd?: number
  battery_capacity_kwh?: number
  charge_time_hours?: number
  max_speed_kmh?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function now(): string {
  return new Date().toISOString()
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getBusModels(): Promise<BusModel[]> {
  await delay()
  return [...mockBusModels]
}

// ── HU13 – Create bus model ────────────────────────────────────────────────

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
    ...input,
    created_at: now(),
    updated_at: now(),
  }

  mockBusModels.push(model)
  return { ...model }
}

// ── HU14 – Update bus model ────────────────────────────────────────────────

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
    updated_at: now(),
  }

  mockBusModels[idx] = updated
  return { ...updated }
}

// ── HU15 – Delete bus model ────────────────────────────────────────────────

export async function deleteBusModel(id: number): Promise<void> {
  await delay()

  const idx = mockBusModels.findIndex((m) => m.id === id)
  if (idx === -1) throw new Error('MODEL_NOT_FOUND')

  mockBusModels.splice(idx, 1)
}
