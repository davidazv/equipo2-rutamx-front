const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
if (!FIREBASE_API_KEY) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY no está configurada')

const FIREBASE_SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`

export const TOKEN_KEY = 'rutamx_id_token'
export const ROLE_KEY = 'rutamx_role'

interface FirebaseSignInResponse {
  idToken: string
  email: string
  displayName: string
  localId: string
  expiresIn: string
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
  return data.idToken
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function saveRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role.toLowerCase())
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
