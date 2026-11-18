import type { ReactNode } from 'react'

interface StatCardProps {
  valor: number | string
  etiqueta: string
  icono: ReactNode
  variante?: 'success' | 'warning' | 'primary' | 'info'
}

// Tarjeta de resumen (estructura HelpDesk360, S15): ícono a la izquierda, etiqueta y número
export default function StatCard({ valor, etiqueta, icono, variante = 'success' }: StatCardProps) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <span
          className={`rounded-3 d-inline-flex align-items-center justify-content-center fs-4 bg-${variante}-subtle`}
          style={{ width: 48, height: 48 }}
          aria-hidden="true"
        >
          {icono}
        </span>
        <div>
          <div className="text-muted small">{etiqueta}</div>
          <div className="fs-3 fw-bold lh-1">{valor}</div>
        </div>
      </div>
    </div>
  )
}