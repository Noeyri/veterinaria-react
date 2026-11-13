import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { ApiError } from '../services/http'

export default function Login() {
  const { usuario, cargando: verificandoSesion, error: errorSesion, login, verificarSesion } = useSession()
  const location = useLocation()
  const usernameRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  if (usuario) return <Navigate to={destinoInterno(location.state)} replace />

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)
    setErrorLogin('')
    try {
      await login(username.trim(), password)
    } catch (cause) {
      setErrorLogin(
        cause instanceof ApiError && cause.status === 401
          ? 'Correo o contraseña incorrectos.'
          : cause instanceof Error
            ? cause.message
            : 'No se pudo iniciar sesión.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <h1 className="h3 mb-3">Ingresar</h1>
        <form onSubmit={handleSubmit} className="card card-body shadow-sm">
          {errorSesion && (
            <div className="alert alert-warning" role="alert">
              No se pudo verificar la sesión: {errorSesion.message}
              <button type="button" className="btn btn-link p-0 ms-2" onClick={() => void verificarSesion()}>
                Reintentar
              </button>
            </div>
          )}
          {errorLogin && <div className="alert alert-danger" role="alert">{errorLogin}</div>}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input id="username" ref={usernameRef} autoComplete="username" className="form-control" required
              minLength={3} maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" className="form-control" required
              minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-success" disabled={enviando || verificandoSesion}>
            {enviando ? 'Ingresando...' : 'Entrar'}
          </button>
          <p className="text-muted small mt-3 mb-0">
            ¿Necesitas una cuenta? Solicítala al administrador de la clínica.
          </p>
          {import.meta.env.DEV && (
            <div className="alert alert-info small mt-3 mb-0">
              <strong>Credenciales locales:</strong>
              <br />admin / admin123
              <br />recepcionista / recepcionista123
              <br />veterinario / veterinario123
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function destinoInterno(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/'
  const from = state.from
  if (!from || typeof from !== 'object' || !('pathname' in from)) return '/'

  const { pathname, search, hash } = from as { pathname?: unknown; search?: unknown; hash?: unknown }
  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('\\')
  ) return '/'

  const query = typeof search === 'string' && search.startsWith('?') ? search : ''
  const fragment = typeof hash === 'string' && hash.startsWith('#') ? hash : ''
  return `${pathname}${query}${fragment}`
}
