import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import SearchInput from '../components/SearchInput'
import ServiceCard from '../components/ServiceCard'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import { serviciosService } from '../services/serviciosService'
import type { Servicio } from '../types'

interface ServicioForm {
  nombre: string
  precio: string
}

const formularioVacio: ServicioForm = { nombre: '', precio: '' }

export default function Servicios() {
  const { usuario } = useSession()
  const navigate = useNavigate()
  const puedeAdministrar = usuario?.rol === 'Administrador'
  const { data, loading, error, reload } = useFetch(serviciosService.getAll)
  const [busqueda, setBusqueda] = useState('')
  const [servicioEditado, setServicioEditado] = useState<Servicio | null>(null)
  const [formulario, setFormulario] = useState<ServicioForm>(formularioVacio)
  const buscarRef = useRef<HTMLInputElement>(null)
  const { mutate: guardar, loading: guardando, error: errorGuardar } = useMutation(
    (datos: Omit<Servicio, 'id'> & { id?: number }) => {
      const { id, ...servicio } = datos
      return id ? serviciosService.update(id, servicio) : serviciosService.create(servicio)
    },
  )

  useEffect(() => {
    buscarRef.current?.focus()
  }, [])

  const iniciarEdicion = (servicio: Servicio) => {
    setServicioEditado(servicio)
    setFormulario({ nombre: servicio.nombre, precio: String(servicio.precio) })
  }

  const cancelarEdicion = () => {
    setServicioEditado(null)
    setFormulario(formularioVacio)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const guardado = await guardar({
      ...(servicioEditado ? { id: servicioEditado.id } : {}),
      nombre: formulario.nombre.trim(),
      precio: Number(formulario.precio),
    })
    if (!guardado) return
    cancelarEdicion()
    reload()
  }

  const eliminarServicio = (servicio: Servicio) => serviciosService.delete(servicio.id)

  const handleDeleted = (servicio: Servicio) => {
    if (servicioEditado?.id === servicio.id) cancelarEdicion()
    reload()
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (data ?? []).filter((s) => s.nombre.toLowerCase().includes(q))
  }, [data, busqueda])

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Servicios</h1>
        {puedeAdministrar && <span className="badge text-bg-primary">Administración del catálogo</span>}
      </div>
      {puedeAdministrar && (
        <form onSubmit={handleSubmit} className="card card-body shadow-sm mb-4">
          <h2 className="h5">{servicioEditado ? 'Editar servicio' : 'Agregar servicio'}</h2>
          {errorGuardar && <div className="alert alert-danger" role="alert">{errorGuardar.message}</div>}
          <div className="row g-3 align-items-end">
            <div className="col-md-7">
              <label htmlFor="servicio-nombre" className="form-label">Nombre del servicio</label>
              <input
                id="servicio-nombre"
                className="form-control"
                required
                maxLength={80}
                value={formulario.nombre}
                onChange={(e) => setFormulario((prev) => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="servicio-precio" className="form-label">Precio (S/)</label>
              <input
                id="servicio-precio"
                type="number"
                className="form-control"
                required
                min="0"
                step="0.01"
                value={formulario.precio}
                onChange={(e) => setFormulario((prev) => ({ ...prev, precio: e.target.value }))}
              />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : servicioEditado ? 'Guardar' : 'Agregar'}
              </button>
              {servicioEditado && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      )}
      <div className="mb-3 col-md-6 px-0">
        <SearchInput ref={buscarRef} value={busqueda} onChange={setBusqueda}
          placeholder="Buscar servicio..." />
      </div>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {filtrados.length === 0 ? (
          <div className="alert alert-info">No se encontraron servicios.</div>
        ) : (
          <div className="row g-3">
            {filtrados.map((s) => (
              <div className="col-sm-6 col-lg-4" key={s.id}>
                <ServiceCard
                  servicio={s}
                  onAgendar={usuario?.rol === 'Veterinario' ? undefined : (sv) => navigate(`/registro?servicio=${sv.id}`)}
                  onEditar={puedeAdministrar ? iniciarEdicion : undefined}
                  onEliminar={puedeAdministrar ? eliminarServicio : undefined}
                  onEliminado={() => handleDeleted(s)}
                />
              </div>
            ))}
          </div>
        )}
      </AsyncState>
    </>
  )
}
