interface FiltroChipsProps<T extends string> {
  opciones: readonly T[]
  valor: T
  onChange: (valor: T) => void
  etiqueta?: string
}

// Chips de filtro (S15): Todas · Abiertas · En progreso · Completadas
export default function FiltroChips<T extends string>({ opciones, valor, onChange, etiqueta }: FiltroChipsProps<T>) {
  return (
    <div className="d-flex flex-wrap gap-2" role="group" aria-label={etiqueta ?? 'Filtro'}>
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          className={'btn btn-sm rounded-pill ' + (o === valor ? 'btn-success' : 'btn-outline-secondary')}
          aria-pressed={o === valor}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}