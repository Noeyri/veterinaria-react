import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import AvisosSistema from '../components/AvisosSistema'
import ErrorBoundary from '../components/ErrorBoundary'
import { useSession } from '../context/SessionContext'

export default function Inicio() {
  const { usuario } = useSession()

  return (
    <>
      <ErrorBoundary mensaje="No se pudieron cargar los avisos del sistema.">
        <Suspense
          fallback={
            <div className="d-flex align-items-center gap-2 text-muted mb-4" role="status">
              <div className="spinner-border spinner-border-sm text-success" aria-hidden="true"></div>
              Cargando avisos...
            </div>
          }
        >
          <AvisosSistema />
        </Suspense>
      </ErrorBoundary>

      <div className="text-center py-4">
        <h1 className="display-5 fw-bold">
          {usuario ? `Hola, ${usuario.nombre}` : 'Bienvenido a Veterinaria'}
        </h1>
        {usuario && <p className="text-muted mb-0">Sesión iniciada como {usuario.rol}</p>}
        <p className="lead text-muted">Gestiona mascotas, citas y servicios en un solo lugar.</p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Link to="/mascotas" className="btn btn-success">Ver mascotas</Link>
          <Link to="/citas" className="btn btn-outline-success">Ver citas</Link>
          {usuario?.rol !== 'Veterinario' && <Link to="/registro?tab=mascota" className="btn btn-outline-secondary">Registrar mascota</Link>}
        </div>
      </div>
    </>
  )
}
