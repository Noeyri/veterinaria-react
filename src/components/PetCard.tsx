import { Link } from 'react-router-dom'
import DeleteButton from './DeleteButton'
import type { Mascota } from '../types'

export interface PetCardProps {
  mascota: Mascota
  duenoNombre: string
  canManage: boolean
  onDelete: () => Promise<void>
  onDeleted: () => void
}

const emoji: Record<string, string> = { Perro: '🐶', Gato: '🐱', Ave: '🐦' }

export default function PetCard({ mascota, duenoNombre, canManage, onDelete, onDeleted }: PetCardProps) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="display-6 mb-2">{emoji[mascota.especie] ?? '🐾'}</div>
        <h2 className="h5 card-title">{mascota.nombre}</h2>
        <p className="card-text mb-1">
          <span className="badge text-bg-success me-1">{mascota.especie}</span>
          {mascota.raza}
        </p>
        <p className="card-text text-muted small mb-0">Dueño: {duenoNombre}</p>
      </div>
      <div className="card-footer bg-body border-0 d-flex flex-wrap gap-2">
        <Link to={`/mascotas/${mascota.id}`} className="btn btn-outline-success btn-sm">Ver detalle</Link>
        {canManage && (
          <>
            <Link to={`/registro?tab=mascota&editar=${mascota.id}`} className="btn btn-outline-primary btn-sm">Editar</Link>
            <DeleteButton
              confirmation={`¿Eliminar a ${mascota.nombre}?`}
              onDelete={onDelete}
              onDeleted={onDeleted}
            />
          </>
        )}
      </div>
    </div>
  )
}
