const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
if (!FIREBASE_API_KEY) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY no está configurada')

const FIREBASE_SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
const FIREBASE_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`
const FIREBASE_UPDATE_URL = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`

export const TOKEN_KEY = 'rutamx_id_token'
export const REFRESH_TOKEN_KEY = 'rutamx_refresh_token'
export const ROLE_KEY = 'rutamx_role'
export const USER_KEY = 'rutamx_user'

export interface CurrentUser {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface FirebaseSignInResponse {
  idToken: string
  refreshToken: string
  email: string
  displayName: string
  localId: string
  expiresIn: string
}

interface FirebaseRefreshResponse {
  id_token: string
  refresh_token: string
}

export async function signIn(email: string, password: string): Promise<string> {
  const res = await fetch(FIREBASE_SIGN_IN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const code: string = err?.error?.message ?? 'UNKNOWN_ERROR'
    if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
      throw new Error('Correo o contraseña incorrectos')
    }
    if (code === 'USER_DISABLED') {
      throw new Error('Esta cuenta está deshabilitada')
    }
    throw new Error('Error al iniciar sesión. Intenta de nuevo.')
  }

  const data: FirebaseSignInResponse = await res.json()
  localStorage.setItem(TOKEN_KEY, data.idToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  return data.idToken
}

export async function refreshIdToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null

  const res = await fetch(FIREBASE_REFRESH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  })

  if (!res.ok) return null

  const data: FirebaseRefreshResponse = await res.json()
  localStorage.setItem(TOKEN_KEY, data.id_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  return data.id_token
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_KEY)
}

export function saveUser(user: CurrentUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export async function changePassword(newPassword: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(FIREBASE_UPDATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token, password: newPassword, returnSecureToken: true }),
  })

  if (!res.ok) throw new Error('Error al cambiar la contraseña. Intenta de nuevo.')

  const data = await res.json()
  localStorage.setItem(TOKEN_KEY, data.idToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
}

export function saveRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role.toLowerCase())
}

export function getRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ROLE_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
