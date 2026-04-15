/**
 * User service — all functions are typed for the real API shape.
 * Currently resolves from in-memory mock data. Replace the body of
 * each function with a real fetch() call when the backend is ready.
 */

import {
  User,
  Role,
  UserStatus,
  mockUsers,
  suspensionLogs,
  getNextId,
} from '@/lib/mock/users'

export type { User, Role, UserStatus }

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  role: Role
  status: UserStatus
  password: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  role?: Role
  status?: UserStatus
}

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function now(): string {
  return new Date().toISOString()
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  await delay()
  return [...mockUsers]
}

// ── HU01 – Create user ─────────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<User> {
  await delay()

  const duplicate = mockUsers.find(
    (u) => u.email.toLowerCase() === input.email.toLowerCase()
  )
  if (duplicate) {
    throw new Error('EMAIL_TAKEN')
  }

  const user: User = {
    id: getNextId(),
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    status: input.status,
    createdAt: now(),
    updatedAt: now(),
  }

  mockUsers.push(user)
  return { ...user }
}

// ── HU02 – Update user ─────────────────────────────────────────────────────

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User> {
  await delay()

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('USER_NOT_FOUND')

  if (input.email) {
    const duplicate = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === input.email!.toLowerCase() && u.id !== id
    )
    if (duplicate) throw new Error('EMAIL_TAKEN')
  }

  const updated: User = {
    ...mockUsers[idx],
    ...input,
    updatedAt: now(),
  }

  mockUsers[idx] = updated
  return { ...updated }
}

// ── HU03 – Delete user ─────────────────────────────────────────────────────

export async function deleteUser(id: number): Promise<void> {
  await delay()

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('USER_NOT_FOUND')

  mockUsers.splice(idx, 1)
}

// ── HU04 – Suspend user ────────────────────────────────────────────────────

export async function suspendUser(
  id: number,
  reason: string
): Promise<User> {
  await delay()

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('USER_NOT_FOUND')

  mockUsers[idx] = { ...mockUsers[idx], status: 'SUSPENDED', updatedAt: now() }

  suspensionLogs.push({ userId: id, date: now(), reason })

  return { ...mockUsers[idx] }
}

// ── HU04 – Reinstate (unsuspend) user ──────────────────────────────────────

export async function reinstateUser(id: number): Promise<User> {
  await delay()

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('USER_NOT_FOUND')

  mockUsers[idx] = { ...mockUsers[idx], status: 'ACTIVE', updatedAt: now() }

  return { ...mockUsers[idx] }
}
