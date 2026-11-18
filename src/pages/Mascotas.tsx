import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import PetCard from '../components/PetCard'
import SearchInput from '../components/SearchInput'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { citasService } from '../services/citasService'
import { duenosService } from '../services/duenosService'
import { mascotasService } from '../services/mascotasService'
import FiltroEspecie from '../components/FiltroEspecie'
import { useFiltro } from '../context/FiltroContext'

export default function Mascotas() {
  const { usuario } = useSession()
  const puedeGestionar = usuario?.rol !== 'Veterinario'
  const { data, loading, error, reload } = useFetch(() =>
    Promise.all([mascotasService.getAll(), duenosService.getAll()]),
  )
  const [busqueda, setBusqueda] = useState('')
  const { filtroEspecie: especie, setFiltroEspecie } = useFiltro()
  const buscarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    buscarRef.current?.focus()
  }, [])

  const mascotas = data?.[0]
  const duenos = data?.[1]

  const nombreDueno = (id: number) => duenos?.find((d) => d.id === id)?.nombre ?? '—'
  const eliminarMascota = async (id: number) => {
    const citas = await citasService.getAll()
    if (citas.some((cita) => cita.mascotaId === id)) {
      throw new Error('No se puede eliminar esta mascota porque tiene citas asociadas. Elimina primero sus citas.')
    }
    await mascotasService.delete(id)
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (mascotas ?? []).filter(
      (m) =>
        (especie === 'Todas' || m.especie === especie) &&
        (!q ||
          m.nombre.toLowerCase().includes(q) ||
          m.raza.toLowerCase().includes(q) ||
          (duenos?.find((d) => d.id === m.duenoId)?.nombre ?? '').toLowerCase().includes(q)),
    )
  }, [mascotas, duenos, busqueda, especie])

  const limpiar = () => {
    setBusqueda('')
    setFiltroEspecie('Todas')
    buscarRef.current?.focus()
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Mascotas</h1>
        {puedeGestionar && <Link to="/registro?tab=mascota" className="btn btn-success btn-sm">+ Nueva mascota</Link>}
      </div>

      <div className="d-flex flex-wrap gap-2 mb-2">
        <div className="flex-grow-1">
          <SearchInput ref={buscarRef} value={busqueda} onChange={setBusqueda}
            placeholder="Buscar por nombre, raza o dueño..." />
        </div>
        <button type="button" className="btn btn-outline-primary" onClick={() => buscarRef.current?.focus()}>
          Ir al buscador
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Limpiar</button>
      </div>
      <div className="mb-3">
        <FiltroEspecie />
      </div>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {filtradas.length === 0 ? (
          <div className="alert alert-info">No se encontraron mascotas.</div>
        ) : (
          <div className="row g-3">
            {filtradas.map((m) => (
              <div className="col-sm-6 col-lg-4" key={m.id}>
                <PetCard
                  mascota={m}
                  duenoNombre={nombreDueno(m.duenoId)}
                  canManage={puedeGestionar}
                  onDelete={() => eliminarMascota(m.id)}
                  onDeleted={reload}
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-muted small mt-3 mb-0">Mostrando {filtradas.length} de {mascotas?.length ?? 0} mascotas</p>
      </AsyncState>
    </>
  )
}
