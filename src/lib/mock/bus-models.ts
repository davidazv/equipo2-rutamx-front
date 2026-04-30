// ── Types ──────────────────────────────────────────────────────────────────

export type FuelType = 'ELECTRIC' | 'HYBRID' | 'HYDROGEN'

export interface BusModel {
  id: number
  name: string
  manufacturer: string
  fuel_type: FuelType
  autonomy_km: number
  passenger_capacity: number
  unit_cost_usd: number
  battery_capacity_kwh: number
  charge_time_hours: number
  max_speed_kmh: number
  created_at: string
  updated_at: string
}

// ── Seed data ──────────────────────────────────────────────────────────────

// Mutable module-level state — persists for the browser session.
// Swap these with real API responses when the backend is ready.
export const mockBusModels: BusModel[] = [
  {
    id: 1,
    name: 'eCitaro G',
    manufacturer: 'Mercedes-Benz',
    fuel_type: 'ELECTRIC',
    autonomy_km: 250,
    passenger_capacity: 120,
    unit_cost_usd: 620000,
    battery_capacity_kwh: 392,
    charge_time_hours: 3.5,
    max_speed_kmh: 80,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-02-20T10:30:00Z',
  },
  {
    id: 2,
    name: 'Urbino 18 Electric',
    manufacturer: 'Solaris',
    fuel_type: 'ELECTRIC',
    autonomy_km: 300,
    passenger_capacity: 130,
    unit_cost_usd: 680000,
    battery_capacity_kwh: 420,
    charge_time_hours: 4.0,
    max_speed_kmh: 80,
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-02-19T14:00:00Z',
  },
  {
    id: 3,
    name: 'Aptis',
    manufacturer: 'Alstom',
    fuel_type: 'ELECTRIC',
    autonomy_km: 200,
    passenger_capacity: 100,
    unit_cost_usd: 590000,
    battery_capacity_kwh: 330,
    charge_time_hours: 3.0,
    max_speed_kmh: 70,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-18T09:15:00Z',
  },
  {
    id: 4,
    name: 'Caetano H2.City Gold',
    manufacturer: 'CaetanoBus',
    fuel_type: 'HYDROGEN',
    autonomy_km: 400,
    passenger_capacity: 110,
    unit_cost_usd: 850000,
    battery_capacity_kwh: 44,
    charge_time_hours: 0.67,
    max_speed_kmh: 85,
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-02-17T16:00:00Z',
  },
  {
    id: 5,
    name: "Lion's City Hybrid",
    manufacturer: 'MAN',
    fuel_type: 'HYBRID',
    autonomy_km: 500,
    passenger_capacity: 95,
    unit_cost_usd: 420000,
    battery_capacity_kwh: 78,
    charge_time_hours: 5.5,
    max_speed_kmh: 90,
    created_at: '2024-01-20T12:00:00Z',
    updated_at: '2024-02-16T11:00:00Z',
  },
  {
    id: 6,
    name: 'E12',
    manufacturer: 'BYD',
    fuel_type: 'ELECTRIC',
    autonomy_km: 280,
    passenger_capacity: 105,
    unit_cost_usd: 480000,
    battery_capacity_kwh: 374,
    charge_time_hours: 4.5,
    max_speed_kmh: 80,
    created_at: '2024-01-22T13:00:00Z',
    updated_at: '2024-02-15T09:00:00Z',
  },
]

let nextId = mockBusModels.length + 1
export function getNextBusModelId(): number {
  return nextId++
}
