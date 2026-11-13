import type { Dueno } from '../types'
import { http } from './http'

type NuevoDueno = Omit<Dueno, 'id'>

export const duenosService = {
  getAll: () => http.get<Dueno[]>('/duenos'),
  getById: (id: number) => http.get<Dueno>(`/duenos/${id}`),
  create: (datos: NuevoDueno) => http.post<Dueno, NuevoDueno>('/duenos', datos),
  update: (id: number, datos: NuevoDueno) => http.put<Dueno, NuevoDueno>(`/duenos/${id}`, datos),
  delete: (id: number) => http.delete(`/duenos/${id}`),
}
