import type { Servicio } from '../types'

export interface ServiceCardProps {
  servicio: Servicio
  onAgendar?: (servicio: Servicio) => void
}

export default function ServiceCard({ servicio, onAgendar }: ServiceCardProps) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h2 className="h5 card-title">{servicio.nombre}</h2>
        <p className="fs-4 text-success fw-bold mb-0">S/ {servicio.precio.toFixed(2)}</p>
      </div>
      {onAgendar && (
        <div className="card-footer bg-body border-0">
          <button className="btn btn-success btn-sm w-100" onClick={() => onAgendar(servicio)}>
            Agendar cita
          </button>
        </div>
      )}
    </div>
  )
}
