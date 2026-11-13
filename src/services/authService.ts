import type { Usuario } from '../context/SessionContext'
import { http } from './http'

interface Credenciales {
  username: string
  password: string
}

export const authService = {
  login: (credentials: Credenciales) => http.post<Usuario, Credenciales>('/auth/login', credentials),
  me: () => http.get<Usuario>('/auth/me'),
  logout: () => http.post<void, Record<string, never>>('/auth/logout', {}),
}
