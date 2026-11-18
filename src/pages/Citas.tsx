import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import DataTable from '../components/DataTable'
import DeleteButton from '../components/DeleteButton'
import SearchInput from '../components/SearchInput'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { citasService } from '../services/citasService'
import { mascotasService } from '../services/mascotasService'
import { serviciosService } from '../services/serviciosService'
import FiltroChips from '../components/FiltroChips'
const estados = ['Todos', 'Pendiente', 'Atendida', 'Cancelada'] as const
const badge = { Pendiente: 'warning', Atendida: 'success', Cancelada: 'secondary' } as const

export default function Citas() {
  const { usuario } = useSession()
  const puedeGestionar = usuario?.rol !== 'Veterinario'
  const { data, loading, error, reload } = useFetch(() =>
    Promise.all([citasService.getAll(), mascotasService.getAll(), serviciosService.getAll()]),
  )
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<(typeof estados)[number]>('Todos')
  const buscarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    buscarRef.current?.focus()
  }, [])

  const citas = data?.[0]
  const mascotas = data?.[1]
  const servicios = data?.[2]

  const nombreMascota = (id: number) => mascotas?.find((m) => m.id === id)?.nombre ?? '—'
  const nombreServicio = (id: number) => servicios?.find((s) => s.id === id)?.nombre ?? '—'

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (citas ?? []).filter(
      (c) =>
        (estado === 'Todos' || c.estado === estado) &&
        (!q ||
          (mascotas?.find((m) => m.id === c.mascotaId)?.nombre ?? '').toLowerCase().includes(q) ||
          (servicios?.find((s) => s.id === c.servicioId)?.nombre ?? '').toLowerCase().includes(q) ||
          c.fecha.includes(q)),
    )
  }, [citas, mascotas, servicios, busqueda, estado])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Citas</h1>
        {puedeGestionar && <Link to="/registro?tab=cita" className="btn btn-success btn-sm">+ Nueva cita</Link>}
      </div>
      <div className="mb-2">
        <SearchInput ref={buscarRef} value={busqueda} onChange={setBusqueda}
          placeholder="Buscar por mascota, servicio o fecha..." />
      </div>
      <div className="mb-3">
        <FiltroChips opciones={estados} valor={estado} onChange={setEstado} etiqueta="Filtrar por estado" />
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload}>
        <DataTable title="Listado" headers={['#', 'Fecha', 'Mascota', 'Servicio', 'Estado', 'Acciones']}>
          {filtradas.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.fecha}</td>
              <td>{nombreMascota(c.mascotaId)}</td>
              <td>{nombreServicio(c.servicioId)}</td>
              <td>
                <span className={`badge text-bg-${badge[c.estado]}`}>{c.estado}</span>
              </td>
              <td className="text-end">
                <div className="d-inline-flex gap-2 align-items-start">
                  <Link to={`/citas/${c.id}`} className="btn btn-outline-success btn-sm">Ver</Link>
                  <Link to={`/registro?tab=cita&editar=${c.id}`} className="btn btn-outline-primary btn-sm">
                    {puedeGestionar ? 'Editar' : 'Cambiar estado'}
                  </Link>
                  {puedeGestionar && (
                    <DeleteButton
                      confirmation={`¿Eliminar la cita del ${c.fecha}?`}
                      onDelete={() => citasService.delete(c.id)}
                      onDeleted={reload}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
        <p className="text-muted small mt-3 mb-0">Mostrando {filtradas.length} de {citas?.length ?? 0} citas</p>
      </AsyncState>
    </>
  )
}
