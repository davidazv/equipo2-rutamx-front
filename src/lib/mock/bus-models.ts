// ── Types ──────────────────────────────────────────────────────────────────

export type FuelType = 'ELECTRIC' | 'DIESEL'

export interface BusModel {
  id: number
  name: string
  manufacturer: string
  fuelType: FuelType
  autonomyKm: number
  passengerCapacity: number
  unitCostUsd: number
  batteryCapacityKwh: number | null
  energyConsumptionKwhKm: number | null
  fuelConsumptionLKm: number | null
  maintenanceCostPerKm: number | null
  co2EmissionsGKm: number | null
}

// ── Seed data ──────────────────────────────────────────────────────────────

// Mutable module-level state — persists for the browser session.
// Used by admin CRUD (HU13/14/15) while those use mock data.
export const mockBusModels: BusModel[] = [
  {
    id: 1,
    name: 'Yutong E12PRO',
    manufacturer: 'Yutong',
    fuelType: 'ELECTRIC',
    autonomyKm: 300,
    passengerCapacity: 85,
    unitCostUsd: 420000,
    batteryCapacityKwh: 352.08,
    energyConsumptionKwhKm: 1.0,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
  {
    id: 2,
    name: 'Yutong ZK5120C',
    manufacturer: 'Yutong',
    fuelType: 'ELECTRIC',
    autonomyKm: 130,
    passengerCapacity: 85,
    unitCostUsd: 300000,
    batteryCapacityKwh: 127.51,
    energyConsumptionKwhKm: 1.0,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.12,
    co2EmissionsGKm: 0,
  },
  {
    id: 3,
    name: 'Yutong ZK5180C',
    manufacturer: 'Yutong',
    fuelType: 'ELECTRIC',
    autonomyKm: 120,
    passengerCapacity: 140,
    unitCostUsd: 550000,
    batteryCapacityKwh: 155.33,
    energyConsumptionKwhKm: 1.3,
    fuelConsumptionLKm: 0,
    maintenanceCostPerKm: 0.15,
    co2EmissionsGKm: 0,
  },
  {
    id: 4,
    name: 'Yutong DMT Hybrid H8',
    manufacturer: 'Yutong',
    fuelType: 'DIESEL',
    autonomyKm: 400,
    passengerCapacity: 61,
    unitCostUsd: 120000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.35,
    maintenanceCostPerKm: 0.22,
    co2EmissionsGKm: 940,
  },
  {
    id: 5,
    name: 'Yutong DMT Hybrid H10',
    manufacturer: 'Yutong',
    fuelType: 'DIESEL',
    autonomyKm: 400,
    passengerCapacity: 80,
    unitCostUsd: 150000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.40,
    maintenanceCostPerKm: 0.25,
    co2EmissionsGKm: 1070,
  },
  {
    id: 6,
    name: 'Yutong DMT Hybrid H12',
    manufacturer: 'Yutong',
    fuelType: 'DIESEL',
    autonomyKm: 700,
    passengerCapacity: 87,
    unitCostUsd: 200000,
    batteryCapacityKwh: 0,
    energyConsumptionKwhKm: 0,
    fuelConsumptionLKm: 0.35,
    maintenanceCostPerKm: 0.22,
    co2EmissionsGKm: 940,
  },
]

let nextId = mockBusModels.length + 1
export function getNextBusModelId(): number {
  return nextId++
}
