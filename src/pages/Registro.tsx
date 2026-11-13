import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CitaForm from '../components/CitaForm'
import DuenoForm from '../components/DuenoForm'
import MascotaForm from '../components/MascotaForm'
import { useSession } from '../context/SessionContext'

type Tab = 'mascota' | 'cita' | 'dueno'

const tabs: { id: Tab; label: string }[] = [
  { id: 'mascota', label: 'Mascota' },
  { id: 'cita', label: 'Cita' },
  { id: 'dueno', label: 'Dueño' },
]

export default function Registro() {
  const { usuario } = useSession()
  const [params] = useSearchParams()
  const servicio = Number(params.get('servicio')) || undefined
  const editarId = Number(params.get('editar')) || undefined
  const tabParam = params.get('tab')
  const [tab, setTab] = useState<Tab>(
    servicio ? 'cita' : tabs.some((t) => t.id === tabParam) ? (tabParam as Tab) : 'mascota',
  )
  const etiquetaTab = tabs.find((t) => t.id === tab)?.label

  if (usuario?.rol === 'Veterinario') {
    if (tabParam !== 'cita' || !editarId) {
      return <div className="alert alert-danger" role="alert">No tienes permiso para registrar o editar este tipo de datos.</div>
    }
    return (
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <h1 className="h3 mb-3">Actualizar estado de cita</h1>
          <CitaForm editarId={editarId} soloEstado />
        </div>
      </div>
    )
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <h1 className="h3 mb-3">{editarId ? `Editar ${etiquetaTab?.toLowerCase()}` : 'Registro'}</h1>
        {editarId ? (
          tab === 'mascota'
            ? <MascotaForm editarId={editarId} />
            : tab === 'cita'
              ? <CitaForm editarId={editarId} />
              : <DuenoForm editarId={editarId} />
        ) : (
          <>
            <ul className="nav nav-pills mb-3">
              {tabs.map((t) => (
                <li className="nav-item" key={t.id}>
                  <button className={'nav-link' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
            {tab === 'mascota' && <MascotaForm />}
            {tab === 'cita' && <CitaForm servicioInicial={servicio} />}
            {tab === 'dueno' && <DuenoForm />}
          </>
        )}
      </div>
    </div>
  )
}
