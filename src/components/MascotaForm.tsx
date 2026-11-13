import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import { duenosService } from '../services/duenosService'
import { mascotasService } from '../services/mascotasService'
import type { Mascota } from '../types'

interface FormState {
  nombre: string
  especie: string
  raza: string
  duenoId: string
}

const initial: FormState = { nombre: '', especie: 'Perro', raza: '', duenoId: '' }

export default function MascotaForm({ editarId }: { editarId?: number }) {
  const navigate = useNavigate()
  const nombreRef = useRef<HTMLInputElement>(null)
  const { data, loading: cargando, error: errorCarga } = useFetch(
    () => Promise.all([
      duenosService.getAll(),
      editarId ? mascotasService.getById(editarId) : Promise.resolve(null),
    ]),
    [editarId],
  )
  const { mutate: guardar, loading: guardando, error: errorGuardar } = useMutation(
    (datos: Omit<Mascota, 'id'>) =>
      editarId ? mascotasService.update(editarId, datos) : mascotasService.create(datos),
  )
  const duenos = data?.[0]
  const mascota = data?.[1]
  const [form, setForm] = useState<FormState>(initial)

  useEffect(() => {
    nombreRef.current?.focus()
  }, [])

  useEffect(() => {
    if (mascota) {
      setForm({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        duenoId: String(mascota.duenoId),
      })
    }
  }, [mascota])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const guardada = await guardar({
      nombre: form.nombre.trim(),
      especie: form.especie,
      raza: form.raza.trim(),
      duenoId: Number(form.duenoId),
    })
    if (guardada) navigate(`/mascotas/${guardada.id}`)
  }

  const handleReset = () => {
    setForm(initial)
    nombreRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body shadow-sm">
      {errorCarga && <div className="alert alert-danger">{errorCarga.message}</div>}
      {errorGuardar && <div className="alert alert-danger">{errorGuardar.message}</div>}
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">Nombre</label>
        <input id="nombre" name="nombre" ref={nombreRef} className="form-control" required
          value={form.nombre} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="especie" className="form-label">Especie</label>
        <select id="especie" name="especie" className="form-select"
          value={form.especie} onChange={handleChange}>
          <option>Perro</option>
          <option>Gato</option>
          <option>Ave</option>
          <option>Otro</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="raza" className="form-label">Raza</label>
        <input id="raza" name="raza" className="form-control" required
          value={form.raza} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="duenoId" className="form-label">Dueño</label>
        <select id="duenoId" name="duenoId" className="form-select" required
          value={form.duenoId} onChange={handleChange} disabled={cargando}>
          <option value="">{cargando ? 'Cargando dueños...' : 'Selecciona un dueño'}</option>
          {(duenos ?? []).map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>
      </div>
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-success"
          disabled={guardando || cargando || Boolean(editarId && !mascota)}
        >
          {guardando ? 'Guardando...' : editarId ? 'Guardar cambios' : 'Guardar'}
        </button>
        {editarId
          ? <Link to={`/mascotas/${editarId}`} className="btn btn-outline-secondary">Cancelar</Link>
          : <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>Limpiar</button>}
      </div>
    </form>
  )
}
