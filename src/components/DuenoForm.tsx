import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import { duenosService } from '../services/duenosService'

interface FormState {
  nombre: string
  telefono: string
  email: string
}

const initial: FormState = { nombre: '', telefono: '', email: '' }

export default function DuenoForm({ editarId }: { editarId?: number }) {
  const navigate = useNavigate()
  const nombreRef = useRef<HTMLInputElement>(null)
  const { data: dueno, loading: cargando, error: errorCarga } = useFetch(
    () => (editarId ? duenosService.getById(editarId) : Promise.resolve(null)),
    [editarId],
  )
  const { mutate: guardar, loading: guardando, error: errorGuardar } = useMutation(
    (datos: FormState) => editarId ? duenosService.update(editarId, datos) : duenosService.create(datos),
  )
  const [form, setForm] = useState<FormState>(initial)

  useEffect(() => {
    nombreRef.current?.focus()
  }, [])

  useEffect(() => {
    if (dueno) setForm({ nombre: dueno.nombre, telefono: dueno.telefono, email: dueno.email })
  }, [dueno])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const guardado = await guardar({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
    })
    if (guardado) navigate('/duenos')
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body shadow-sm">
      {errorCarga && <div className="alert alert-danger">{errorCarga.message}</div>}
      {errorGuardar && <div className="alert alert-danger">{errorGuardar.message}</div>}
      <div className="mb-3">
        <label htmlFor="d-nombre" className="form-label">Nombre completo</label>
        <input id="d-nombre" name="nombre" ref={nombreRef} className="form-control" required
          value={form.nombre} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="d-telefono" className="form-label">Teléfono</label>
        <input id="d-telefono" name="telefono" type="tel" className="form-control" required
          pattern="[0-9]{7,9}" title="Entre 7 y 9 dígitos"
          value={form.telefono} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="d-email" className="form-label">Email</label>
        <input id="d-email" name="email" type="email" className="form-control" required
          value={form.email} onChange={handleChange} />
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-success" disabled={guardando || cargando || Boolean(editarId && !dueno)}>
          {guardando ? 'Guardando...' : editarId ? 'Guardar cambios' : 'Guardar dueño'}
        </button>
        {editarId && <Link to="/duenos" className="btn btn-outline-secondary">Cancelar</Link>}
      </div>
    </form>
  )
}
