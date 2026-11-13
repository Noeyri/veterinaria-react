import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import { citasService } from '../services/citasService'
import { mascotasService } from '../services/mascotasService'
import { serviciosService } from '../services/serviciosService'
import type { Cita } from '../types'

interface CitaFormProps {
  servicioInicial?: number
  soloEstado?: boolean
}

interface FormState {
  fecha: string
  mascotaId: string
  servicioId: string
  estado: Cita['estado']
}

export default function CitaForm({ servicioInicial, soloEstado = false, editarId }: CitaFormProps & { editarId?: number }) {
  const navigate = useNavigate()
  const fechaRef = useRef<HTMLInputElement>(null)
  const { data, loading: cargando, error: errorCarga } = useFetch(() =>
    Promise.all([
      mascotasService.getAll(),
      serviciosService.getAll(),
      editarId ? citasService.getById(editarId) : Promise.resolve(null),
    ]),
    [editarId],
  )
  const { mutate: guardar, loading: guardando, error: errorGuardar } = useMutation(
    (datos: Omit<Cita, 'id'>) =>
      editarId ? citasService.update(editarId, datos) : citasService.create(datos),
  )
  const mascotas = data?.[0] ?? []
  const servicios = data?.[1] ?? []
  const cita = data?.[2]
  const [form, setForm] = useState<FormState>({
    fecha: '',
    mascotaId: '',
    servicioId: servicioInicial ? String(servicioInicial) : '',
    estado: 'Pendiente',
  })

  useEffect(() => {
    fechaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (cita) {
      setForm({
        fecha: cita.fecha,
        mascotaId: String(cita.mascotaId),
        servicioId: String(cita.servicioId),
        estado: cita.estado,
      })
    }
  }, [cita])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const guardada = await guardar({
      fecha: form.fecha,
      mascotaId: Number(form.mascotaId),
      servicioId: Number(form.servicioId),
      estado: form.estado,
    })
    if (guardada) navigate(`/citas/${guardada.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body shadow-sm">
      {errorCarga && <div className="alert alert-danger">{errorCarga.message}</div>}
      {errorGuardar && <div className="alert alert-danger">{errorGuardar.message}</div>}
      <div className="mb-3">
        <label htmlFor="fecha" className="form-label">Fecha</label>
        <input id="fecha" name="fecha" type="date" ref={fechaRef} className="form-control" required
          value={form.fecha} onChange={handleChange} disabled={soloEstado} />
      </div>
      <div className="mb-3">
        <label htmlFor="mascotaId" className="form-label">Mascota</label>
        <select id="mascotaId" name="mascotaId" className="form-select" required
          value={form.mascotaId} onChange={handleChange} disabled={soloEstado}>
          <option value="">{cargando ? 'Cargando...' : 'Selecciona una mascota'}</option>
          {mascotas.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre} ({m.especie})</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="servicioId" className="form-label">Servicio</label>
        <select id="servicioId" name="servicioId" className="form-select" required
          value={form.servicioId} onChange={handleChange} disabled={soloEstado}>
          <option value="">{cargando ? 'Cargando...' : 'Selecciona un servicio'}</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} — S/ {s.precio.toFixed(2)}</option>
          ))}
        </select>
      </div>
      {editarId && (
        <div className="mb-3">
          <label htmlFor="estado" className="form-label">Estado</label>
          <select id="estado" name="estado" className="form-select" value={form.estado} onChange={handleChange}>
            <option>Pendiente</option>
            <option>Atendida</option>
            <option>Cancelada</option>
          </select>
        </div>
      )}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-success"
          disabled={guardando || cargando || Boolean(editarId && !cita)}
        >
          {guardando ? 'Guardando...' : editarId ? 'Guardar cambios' : 'Agendar cita'}
        </button>
        {editarId && <Link to={`/citas/${editarId}`} className="btn btn-outline-secondary">Cancelar</Link>}
      </div>
    </form>
  )
}
