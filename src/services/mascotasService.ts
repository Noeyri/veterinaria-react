import type { Mascota } from '../types'
import { http } from './http'

export const mascotasService = {
  getAll: () => http.get<Mascota[]>('/mascotas'),
  getById: (id: number) => http.get<Mascota>(`/mascotas/${id}`),
  create: (datos: Omit<Mascota, 'id'>) => http.post<Mascota, Omit<Mascota, 'id'>>('/mascotas', datos),
  update: (id: number, datos: Omit<Mascota, 'id'>) =>
    http.put<Mascota, Omit<Mascota, 'id'>>(`/mascotas/${id}`, datos),
  delete: (id: number) => http.delete(`/mascotas/${id}`),
}
