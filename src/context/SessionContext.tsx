import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../services/http'
import { authService } from '../services/authService'

export type RolUsuario = 'Recepcionista' | 'Veterinario' | 'Administrador'

export interface Usuario {
  id: string
  username: string
  nombre: string
  rol: RolUsuario
}

interface SessionContextValue {
  usuario: Usuario | null
  cargando: boolean
  error: Error | null
  login: (username: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
  verificarSesion: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const verificarSesion = useCallback(async () => {
    setCargando(true)
    try {
      setUsuario(await authService.me())
      setError(null)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUsuario(null)
        setError(null)
      } else {
        setError(cause instanceof Error ? cause : new Error('No se pudo verificar la sesión.'))
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.removeItem('vet-session')
    } catch {
      // La sesión del servidor no depende de localStorage.
    }
    void verificarSesion()
  }, [verificarSesion])

  const login = async (username: string, password: string) => {
    const authenticatedUser = await authService.login({ username, password })
    setUsuario(authenticatedUser)
    setError(null)
    return authenticatedUser
  }

  const logout = async () => {
    await authService.logout()
    setUsuario(null)
    setError(null)
  }

  return (
    <SessionContext.Provider value={{ usuario, cargando, error, login, logout, verificarSesion }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx
}
