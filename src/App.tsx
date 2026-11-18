import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { useSession } from './context/SessionContext'
import AcercaDe from './pages/AcercaDe'
import CitaDetalle from './pages/CitaDetalle'
import Citas from './pages/Citas'
import Duenos from './pages/Duenos'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import MascotaDetalle from './pages/MascotaDetalle'
import Mascotas from './pages/Mascotas'
import NotFound from './pages/NotFound'
import Registro from './pages/Registro'
import Servicios from './pages/Servicios'

function RequireSession() {
  const { usuario, cargando, error, verificarSesion } = useSession()
  const location = useLocation()

  if (cargando) {
    return <p className="text-center text-muted py-5" role="status">Verificando sesión...</p>
  }
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        No se pudo verificar el acceso: {error.message}
        <button type="button" className="btn btn-link p-0 ms-2" onClick={() => void verificarSesion()}>
          Reintentar
        </button>
        <Link to="/login" className="btn btn-link p-0 ms-2">Ir al login</Link>
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export default function App() {
  const { pathname } = useLocation()
  const routes = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireSession />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/mascotas" element={<Mascotas />} />
        <Route path="/mascotas/:id" element={<MascotaDetalle />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/citas/:id" element={<CitaDetalle />} />
        <Route path="/duenos" element={<Duenos />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/acerca-de" element={<AcercaDe />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )

  return pathname.replace(/\/+$/, '') === '/login' ? routes : <Layout>{routes}</Layout>
}