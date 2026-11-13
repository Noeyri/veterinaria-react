import { use, useState } from 'react'
import { avisosPromise } from '../services/sistemaService'

export default function AvisosSistema() {
  // use() lee la promesa estable; mientras no resuelve, <Suspense> muestra el fallback
  const avisos = use(avisosPromise)
  const [ocultos, setOcultos] = useState<number[]>([])

  const visibles = avisos.filter((a) => !ocultos.includes(a.id))
  if (visibles.length === 0) return null

  return (
    <div className="text-start mb-4">
      {visibles.map((a) => (
        <div key={a.id} className={`alert alert-${a.tipo} alert-dismissible mb-2`} role="alert">
          {a.mensaje}
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setOcultos((prev) => [...prev, a.id])}
          ></button>
        </div>
      ))}
    </div>
  )
}
