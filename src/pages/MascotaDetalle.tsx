import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import DeleteButton from '../components/DeleteButton'
import { useFetch } from '../hooks/useFetch'
import { ApiError } from '../services/http'
import { citasService } from '../services/citasService'
import { duenosService } from '../services/duenosService'
import { mascotasService } from '../services/mascotasService'

export default function MascotaDetalle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useFetch(
    () => Promise.all([mascotasService.getById(Number(id)), duenosService.getAll()]),
    [id],
  )

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="alert alert-warning">
        No existe una mascota con id {id}. <Link to="/mascotas">Volver al listado</Link>
      </div>
    )
  }

  const mascota = data?.[0]
  const dueno = data?.[1].find((d) => d.id === mascota?.duenoId)
  const eliminarMascota = async () => {
    if (!mascota) return
    const citas = await citasService.getAll()
    if (citas.some((cita) => cita.mascotaId === mascota.id)) {
      throw new Error('No se puede eliminar esta mascota porque tiene citas asociadas. Elimina primero sus citas.')
    }
    await mascotasService.delete(mascota.id)
  }

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      {mascota && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h1 className="h4 card-title">{mascota.nombre}</h1>
            <dl className="row mb-0">
              <dt className="col-sm-3">Especie</dt>
              <dd className="col-sm-9">{mascota.especie}</dd>
              <dt className="col-sm-3">Raza</dt>
              <dd className="col-sm-9">{mascota.raza}</dd>
              <dt className="col-sm-3">Dueño</dt>
              <dd className="col-sm-9">{dueno ? `${dueno.nombre} (${dueno.telefono})` : '—'}</dd>
            </dl>
          </div>
          <div className="card-footer bg-body">
            <Link to="/mascotas" className="btn btn-outline-secondary btn-sm">← Volver</Link>
            <Link to={`/registro?tab=mascota&editar=${mascota.id}`} className="btn btn-outline-primary btn-sm ms-2">Editar</Link>
            <span className="ms-2">
              <DeleteButton
                confirmation={`¿Eliminar a ${mascota.nombre}?`}
                onDelete={eliminarMascota}
                onDeleted={() => navigate('/mascotas')}
              />
            </span>
          </div>
        </div>
      )}
    </AsyncState>
  )
}
