// Versión con Fetch API nativo (S14): mismo contrato que serviciosService (Axios).
import { API_BASE_URL } from './http'
import type { Servicio } from '../types'

export async function listarServiciosFetch(): Promise<Servicio[]> {
  const response = await fetch(`${API_BASE_URL}/servicios`, { credentials: 'include' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function crearServicioFetch(servicio: Omit<Servicio, 'id'>): Promise<Servicio> {
  const response = await fetch(`${API_BASE_URL}/servicios`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicio),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}