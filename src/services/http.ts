import axios, { type AxiosRequestConfig } from 'axios'

const HOST = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL ?? `http://${HOST}:3001`).replace(/\/+$/, '')

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
  transitional: { silentJSONParsing: false },
})
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosClient.request<T>({ ...config, url: path })
    if (response.status === 204) return undefined as T
    return response.data
  } catch (cause) {
    if (!axios.isAxiosError(cause)) throw cause

    const status = cause.response?.status ?? 0
    if (cause.code === 'ERR_BAD_RESPONSE' && status > 0 && status < 400) {
      throw new ApiError('La respuesta del servidor no es un JSON válido.', status)
    }
    if (!cause.response) {
      throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo la API (npm run api)?', 0)
    }

    const body: unknown = cause.response.data
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : `Error ${status}: ${cause.response.statusText || 'petición fallida'}`
    throw new ApiError(message, status)
  }
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T, B>(path: string, body: B) =>
    request<T>(path, { method: 'POST', data: body }),
  put: <T, B>(path: string, body: B) =>
    request<T>(path, { method: 'PUT', data: body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
