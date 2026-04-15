export type Role = 'ADMIN' | 'CEO' | 'COO' | 'CMO'
export type UserStatus = 'ACTIVE' | 'SUSPENDED'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: Role
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface SuspensionLog {
  userId: number
  date: string
  reason: string
}

// Mutable module-level state — persists for the browser session.
// Swap these with real API responses when the backend is ready.
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@rutamx.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-02-20T10:30:00Z',
  },
  {
    id: 2,
    email: 'ceo@rutamx.com',
    firstName: 'María',
    lastName: 'González',
    role: 'CEO',
    status: 'ACTIVE',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-02-19T14:00:00Z',
  },
  {
    id: 3,
    email: 'coo@rutamx.com',
    firstName: 'José',
    lastName: 'Martínez',
    role: 'COO',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-18T09:15:00Z',
  },
  {
    id: 4,
    email: 'cmo@rutamx.com',
    firstName: 'Ana',
    lastName: 'López',
    role: 'CMO',
    status: 'SUSPENDED',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
  {
    id: 5,
    email: 'ops@rutamx.com',
    firstName: 'Luis',
    lastName: 'Hernández',
    role: 'COO',
    status: 'ACTIVE',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-17T11:00:00Z',
  },
]

export const suspensionLogs: SuspensionLog[] = [
  {
    userId: 4,
    date: '2024-01-15T16:00:00Z',
    reason: 'Acceso no autorizado detectado.',
  },
]

let nextId = mockUsers.length + 1
export function getNextId(): number {
  return nextId++
}
