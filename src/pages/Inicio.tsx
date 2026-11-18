import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import AvisosSistema from '../components/AvisosSistema'
import DataTable from '../components/DataTable'
import ErrorBoundary from '../components/ErrorBoundary'
import StatCard from '../components/StatCard'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { citasService } from '../services/citasService'
import { mascotasService } from '../services/mascotasService'
import { serviciosService } from '../services/serviciosService'

const badge = { Pendiente: 'warning', Atendida: 'success', Cancelada: 'secondary' } as const

export default function Inicio() {
  const { usuario } = useSession()
  const { data, loading, error, reload } = useFetch(() =>
    Promise.all([mascotasService.getAll(), citasService.getAll(), serviciosService.getAll()]),
  )
  const [mascotas, citas, servicios] = data ?? [[], [], []]
  const pendientes = citas.filter((c) => c.estado === 'Pendiente').length
  const atendidas = citas.filter((c) => c.estado === 'Atendida').length
  const recientes = [...citas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
  const nombreMascota = (id: number) => mascotas.find((m) => m.id === id)?.nombre ?? '—'
  const nombreServicio = (id: number) => servicios.find((s) => s.id === id)?.nombre ?? '—'

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Inicio</h1>
        <p className="text-muted mb-0">
          {usuario ? `Hola, ${usuario.nombre} · ${usuario.rol}` : 'Bienvenido a Veterinaria'}
        </p>
      </div>

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

      <AsyncState loading={loading} error={error} onRetry={reload}>
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3"><StatCard valor={mascotas.length} etiqueta="Mascotas" icono="🐶" variante="success" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard valor={pendientes} etiqueta="Citas pendientes" icono="⏳" variante="warning" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard valor={atendidas} etiqueta="Citas atendidas" icono="✅" variante="primary" /></div>
          <div className="col-sm-6 col-xl-3"><StatCard valor={servicios.length} etiqueta="Servicios" icono="🧾" variante="info" /></div>
        </div>

        <DataTable title="Citas recientes" headers={['#', 'Mascota', 'Servicio', 'Estado', 'Fecha']}>
          {recientes.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-muted py-3">Aún no hay citas.</td></tr>
          ) : (
            recientes.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{nombreMascota(c.mascotaId)}</td>
                <td>{nombreServicio(c.servicioId)}</td>
                <td><span className={`badge rounded-pill text-bg-${badge[c.estado]}`}>{c.estado}</span></td>
                <td>{c.fecha}</td>
              </tr>
            ))
          )}
        </DataTable>
        <div className="text-end mt-2">
          <Link to="/citas" className="fw-semibold">Ver todas las citas →</Link>
        </div>
      </AsyncState>
    </>
  )
}