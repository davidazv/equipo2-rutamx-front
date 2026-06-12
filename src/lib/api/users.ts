import { apiClient, apiFetch } from '@/lib/api/client'

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

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  role: Role
  password: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  role?: Role
}

// Matches DB seed insert order: ADMIN=1, CEO=2, COO=3, CMO=4
const ROLE_ID: Record<Role, number> = {
  ADMIN: 1,
  CEO: 2,
  COO: 3,
  CMO: 4,
}

interface RawUser {
  id: number
  email: string
  firstName: string
  lastName: string
  roleId: number
  roleName: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

function normalize(raw: RawUser): User {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    role: raw.roleName as Role,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const res = await apiFetch('/admin/users')
  if (!res.ok) throw new Error('FETCH_FAILED')
  const json = await res.json()
  const data: RawUser[] = json.items ?? json
  return data.map(normalize)
}

// ── HU01 – Create user ─────────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      roleId: ROLE_ID[input.role],
    }),
  })
  if (res.status === 409) throw new Error('EMAIL_TAKEN')
  if (!res.ok) throw new Error('CREATE_FAILED')
  const raw: RawUser = await res.json()
  return normalize(raw)
}

// ── HU02 – Update user ─────────────────────────────────────────────────────

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  const body: Record<string, unknown> = {}
  if (input.firstName !== undefined) body.firstName = input.firstName
  if (input.lastName !== undefined) body.lastName = input.lastName
  if (input.role !== undefined) body.roleId = ROLE_ID[input.role]

  const res = await apiFetch(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (res.status === 404) throw new Error('USER_NOT_FOUND')
  if (!res.ok) throw new Error('UPDATE_FAILED')
  const raw: RawUser = await res.json()
  return normalize(raw)
}

// ── HU03 – Delete user ─────────────────────────────────────────────────────

export async function deleteUser(id: number): Promise<void> {
  const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' })
  if (res.status === 404) throw new Error('USER_NOT_FOUND')
  if (!res.ok) throw new Error('DELETE_FAILED')
}

// ── HU04 – Suspend user ────────────────────────────────────────────────────

// Note: the backend endpoint does not accept a reason body.
// The reason is shown in the UI confirmation only.
export async function suspendUser(id: number, _reason: string): Promise<User> {
  const res = await apiFetch(`/admin/users/${id}/suspend`, { method: 'PATCH' })
  if (res.status === 404) throw new Error('USER_NOT_FOUND')
  if (!res.ok) throw new Error('SUSPEND_FAILED')
  const raw: RawUser = await res.json()
  return normalize(raw)
}

// ── HU04 – Reinstate (unsuspend) user ──────────────────────────────────────

export async function reinstateUser(id: number): Promise<User> {
  const res = await apiFetch(`/admin/users/${id}/activate`, { method: 'PATCH' })
  if (res.status === 404) throw new Error('USER_NOT_FOUND')
  if (!res.ok) throw new Error('ACTIVATE_FAILED')
  const raw: RawUser = await res.json()
  return normalize(raw)
}

// ── Reset password (admin) ─────────────────────────────────────────────────

export async function resetUserPassword(id: number, newPassword: string): Promise<void> {
  const res = await apiFetch(`/admin/users/${id}/reset-password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  })
  if (res.status === 404) throw new Error('USER_NOT_FOUND')
  if (!res.ok) throw new Error('RESET_FAILED')
}

// ── HU25 – Export users CSV ────────────────────────────────────────────────

export async function exportUsersCsv(): Promise<void> {
  const res = await apiClient.get<Blob>('/admin/users/export', { responseType: 'blob' })
  if (res.status < 200 || res.status >= 300) throw new Error(`EXPORT_FAILED:${res.status}`)

  const disposition = (res.headers['content-disposition'] as string | undefined) ?? ''
  const match = /filename="?([^"]+)"?/.exec(disposition)
  const today = new Date().toISOString().slice(0, 10)
  const filename = match ? match[1] : `usuarios_${today}.csv`

  const blob = res.data
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
