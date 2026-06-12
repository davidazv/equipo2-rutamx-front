import axios, { type AxiosRequestConfig } from 'axios'
import { getToken, refreshIdToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true, // never throw on HTTP status — callers inspect res.ok / res.status
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET') as AxiosRequestConfig['method']
  const data = init.body ? JSON.parse(init.body as string) : undefined

  let response = await apiClient.request({ url: path, method, data })

  if (response.status === 401) {
    const newToken = await refreshIdToken()
    if (newToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
      const retried = await apiClient.request({ url: path, method, data })
      if (retried.status !== 401) response = retried
    } else {
      console.warn('apiFetch: 401, token refresh failed or unavailable')
    }
  }

  const responseData = response.data
  const status = response.status

  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
    ),
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path)
  if (response.status < 200 || response.status >= 300) {
    const msg = typeof response.data === 'string' ? response.data : 'Error desconocido'
    throw new Error(msg)
  }
  return response.data
}
