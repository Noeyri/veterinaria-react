import type { Servicio } from '../types'
import { http } from './http'

type NuevoServicio = Omit<Servicio, 'id'>

export const serviciosService = {
  getAll: () => http.get<Servicio[]>('/servicios'),
  getById: (id: number) => http.get<Servicio>(`/servicios/${id}`),
  create: (datos: NuevoServicio) => http.post<Servicio, NuevoServicio>('/servicios', datos),
  update: (id: number, datos: NuevoServicio) => http.put<Servicio, NuevoServicio>(`/servicios/${id}`, datos),
  delete: (id: number) => http.delete(`/servicios/${id}`),
}
