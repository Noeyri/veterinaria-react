import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import SearchInput from '../components/SearchInput'
import ServiceCard from '../components/ServiceCard'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { serviciosService } from '../services/serviciosService'

export default function Servicios() {
  const { usuario } = useSession()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useFetch(serviciosService.getAll)
  const [busqueda, setBusqueda] = useState('')
  const buscarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    buscarRef.current?.focus()
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (data ?? []).filter((s) => s.nombre.toLowerCase().includes(q))
  }, [data, busqueda])

  return (
    <>
      <h1 className="h3 mb-3">Servicios</h1>
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
                />
              </div>
            ))}
          </div>
        )}
      </AsyncState>
    </>
  )
}
