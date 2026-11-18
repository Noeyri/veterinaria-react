import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/', label: 'Inicio', icono: '🏠', end: true },
  { to: '/mascotas', label: 'Mascotas', icono: '🐶', end: false },
  { to: '/citas', label: 'Citas', icono: '📅', end: false },
  { to: '/duenos', label: 'Dueños', icono: '👥', end: false },
  { to: '/servicios', label: 'Servicios', icono: '🧾', end: false },
  { to: '/registro', label: 'Registro', icono: '➕', end: false },
  { to: '/acerca-de', label: 'Acerca de', icono: 'ℹ️', end: false },
]

// Barra lateral (estructura tipo HelpDesk360 de S15): marca arriba, enlaces al centro, usuario abajo
export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { usuario, cargando, logout } = useSession()
  const [abierto, setAbierto] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  const handleLogout = async () => {
    setCerrandoSesion(true)
    setLogoutError('')
    try {
      await logout()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'No se pudo cerrar la sesión.')
    } finally {
      setCerrandoSesion(false)
    }
  }

  const enlacesVisibles = usuario
    ? links.filter((link) => link.to !== '/registro' || usuario.rol !== 'Veterinario')
    : []
  const iniciales = usuario?.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="app-sidebar bg-success text-white d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center p-3">
        <Link className="fw-bold fs-5 text-white text-decoration-none" to="/">🐾 Veterinaria</Link>
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-lg-none"
          aria-label="Alternar navegación"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          ☰
        </button>
      </div>

      <div className={(abierto ? 'd-flex' : 'd-none') + ' d-lg-flex flex-column flex-grow-1'}>
        <ul className="nav nav-pills flex-column gap-1 px-2 flex-grow-1">
          {enlacesVisibles.map((l) => (
            <li className="nav-item" key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  'nav-link text-white d-flex align-items-center gap-2' + (isActive ? ' bg-white bg-opacity-25 fw-semibold' : '')
                }
              >
                <span aria-hidden="true">{l.icono}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-top border-light border-opacity-25 p-3">
          <button className="btn btn-outline-light btn-sm w-100 mb-3" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
          </button>
          {cargando ? (
            <span className="small" role="status">Verificando...</span>
          ) : usuario ? (
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded-circle bg-white text-success fw-bold d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38 }}
              >
                {iniciales}
              </span>
              <div className="flex-grow-1 lh-sm" style={{ minWidth: 0 }}>
                <div className="fw-semibold text-truncate">{usuario.nombre}</div>
                <div className="small opacity-75">{usuario.rol}</div>
              </div>
              <button className="btn btn-light btn-sm" onClick={() => void handleLogout()} disabled={cerrandoSesion}>
                {cerrandoSesion ? '...' : 'Salir'}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-light btn-sm w-100">Ingresar</Link>
          )}
          {logoutError && <p className="small mt-2 mb-0" role="alert">{logoutError}</p>}
        </div>
      </div>
    </aside>
  )
}