import type { Cita } from '../types'
import { http } from './http'

export const citasService = {
  getAll: () => http.get<Cita[]>('/citas'),
  getById: (id: number) => http.get<Cita>(`/citas/${id}`),
  create: (datos: Omit<Cita, 'id'>) => http.post<Cita, Omit<Cita, 'id'>>('/citas', datos),
  update: (id: number, datos: Omit<Cita, 'id'>) =>
    http.put<Cita, Omit<Cita, 'id'>>(`/citas/${id}`, datos),
  delete: (id: number) => http.delete(`/citas/${id}`),
}
