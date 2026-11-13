import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import DeleteButton from '../components/DeleteButton'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { citasService } from '../services/citasService'
import { ApiError } from '../services/http'
import { mascotasService } from '../services/mascotasService'
import { serviciosService } from '../services/serviciosService'

export default function CitaDetalle() {
  const { usuario } = useSession()
  const puedeGestionar = usuario?.rol !== 'Veterinario'
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useFetch(
    () =>
      Promise.all([
        citasService.getById(Number(id)),
        mascotasService.getAll(),
        serviciosService.getAll(),
      ]),
    [id],
  )

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="alert alert-warning">
        No existe una cita con id {id}. <Link to="/citas">Volver al listado</Link>
      </div>
    )
  }

  const cita = data?.[0]
  const mascota = data?.[1].find((m) => m.id === cita?.mascotaId)
  const servicio = data?.[2].find((s) => s.id === cita?.servicioId)

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      {cita && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h1 className="h4 card-title">Cita #{cita.id}</h1>
            <dl className="row mb-0">
              <dt className="col-sm-3">Fecha</dt>
              <dd className="col-sm-9">{cita.fecha}</dd>
              <dt className="col-sm-3">Mascota</dt>
              <dd className="col-sm-9">
                {mascota ? <Link to={`/mascotas/${mascota.id}`}>{mascota.nombre}</Link> : '—'}
              </dd>
              <dt className="col-sm-3">Servicio</dt>
              <dd className="col-sm-9">
                {servicio ? `${servicio.nombre} (S/ ${servicio.precio.toFixed(2)})` : '—'}
              </dd>
              <dt className="col-sm-3">Estado</dt>
              <dd className="col-sm-9">{cita.estado}</dd>
            </dl>
          </div>
          <div className="card-footer bg-body">
            <Link to="/citas" className="btn btn-outline-secondary btn-sm">← Volver</Link>
            <Link to={`/registro?tab=cita&editar=${cita.id}`} className="btn btn-outline-primary btn-sm ms-2">Editar</Link>
            {puedeGestionar && (
              <span className="ms-2">
                <DeleteButton
                  confirmation={`¿Eliminar la cita del ${cita.fecha}?`}
                  onDelete={() => citasService.delete(cita.id)}
                  onDeleted={() => navigate('/citas')}
                />
              </span>
            )}
          </div>
        </div>
      )}
    </AsyncState>
  )
}
