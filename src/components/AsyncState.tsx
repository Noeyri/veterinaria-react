import type { ReactNode } from 'react'

interface AsyncStateProps {
  loading: boolean
  error: Error | null
  onRetry?: () => void
  children: ReactNode
}

/** Muestra spinner, error (con reintento) o el contenido cuando hay datos. */
export default function AsyncState({ loading, error, onRetry, children }: AsyncStateProps) {
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted py-3" role="status">
        <div className="spinner-border spinner-border-sm text-success" aria-hidden="true"></div>
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
        <span>{error.message}</span>
        {onRetry && (
          <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
