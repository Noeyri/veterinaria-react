import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/mascotas', label: 'Mascotas', end: false },
  { to: '/citas', label: 'Citas', end: false },
  { to: '/duenos', label: 'Dueños', end: false },
  { to: '/servicios', label: 'Servicios', end: false },
  { to: '/registro', label: 'Registro', end: false },
  { to: '/acerca-de', label: 'Acerca de', end: false },
]

export default function Navbar() {
  // Estado global leído directamente del contexto: sin pasar props por la jerarquía
  const { theme, toggleTheme } = useTheme()
  const { usuario, cargando, logout } = useSession()
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🐾 Veterinaria
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto">
            {enlacesVisibles.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    'nav-link' + (isActive ? ' active fw-semibold text-decoration-underline' : '')
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              title="Cambiar tema"
            >
              {theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
            </button>
            {cargando ? (
              <span className="text-white small" role="status">Verificando...</span>
            ) : usuario ? (
              <>
                <span className="text-white small">👤 {usuario.nombre} · {usuario.rol}</span>
                <button className="btn btn-light btn-sm" onClick={() => void handleLogout()} disabled={cerrandoSesion}>
                  {cerrandoSesion ? 'Saliendo...' : 'Salir'}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-light btn-sm">Ingresar</Link>
            )}
          </div>
          {logoutError && <p className="text-white small mb-0 ms-lg-2" role="alert">{logoutError}</p>}
        </div>
      </div>
    </nav>
  )
}
