// Cliente HTTP base de la capa de servicios (Fetch API).
// Todos los servicios de recursos (mascotas, citas, ...) pasan por aquí.

const BASE_URL: string = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init?.headers)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo la API (npm run api)?', 0)
  }

  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText || 'petición fallida'}`
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      // Algunas respuestas de error no incluyen un cuerpo JSON.
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('La respuesta del servidor no es un JSON válido.', response.status)
  }
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T, B>(path: string, body: B) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T, B>(path: string, body: B) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
