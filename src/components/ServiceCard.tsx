import type { Servicio } from '../types'
import DeleteButton from './DeleteButton'

export interface ServiceCardProps {
  servicio: Servicio
  onAgendar?: (servicio: Servicio) => void
  onEditar?: (servicio: Servicio) => void
  onEliminar?: (servicio: Servicio) => Promise<void>
  onEliminado?: () => void
}

export default function ServiceCard({ servicio, onAgendar, onEditar, onEliminar, onEliminado }: ServiceCardProps) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h2 className="h5 card-title">{servicio.nombre}</h2>
        <p className="fs-4 text-success fw-bold mb-0">S/ {servicio.precio.toFixed(2)}</p>
      </div>
      {(onAgendar || onEditar || onEliminar) && (
        <div className="card-footer bg-body border-0 d-flex flex-column gap-2">
          {onAgendar && (
            <button className="btn btn-success btn-sm w-100" onClick={() => onAgendar(servicio)}>
              Agendar cita
            </button>
          )}
          {(onEditar || onEliminar) && (
            <div className="d-flex gap-2">
              {onEditar && (
                <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onEditar(servicio)}>
                  Editar
                </button>
              )}
              {onEliminar && onEliminado && (
                <DeleteButton
                  confirmation={`¿Eliminar el servicio "${servicio.nombre}"?`}
                  onDelete={() => onEliminar(servicio)}
                  onDeleted={onEliminado}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
