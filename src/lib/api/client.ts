import { getToken, refreshIdToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function doFetch(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_URL}${path}`, { ...init, headers })
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const res = await doFetch(path, init, token)

  if (res.status === 401) {
    // Try refreshing the Firebase ID token once before propagating the error
    const newToken = await refreshIdToken()
    if (newToken) {
      const retried = await doFetch(path, init, newToken)
      if (retried.status !== 401) return retried
    }
    // Refresh failed — return the 401 so the component shows its error state.
    // Do NOT call signOut() or redirect here; the user stays on the page and
    // can sign out manually. AuthGuard handles session validation on navigation.
    console.warn('apiFetch: 401, token refresh failed or unavailable')
  }

  return res
}
