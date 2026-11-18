import { use } from 'react'
import { configPromise } from '../services/sistemaService'

export default function FooterClinica() {
  // use() lee la promesa estable; <Suspense> (en Layout) muestra el fallback
  const config = use(configPromise)
  return (
    <footer className="border-top py-3 mt-4 text-center text-muted small">
      © 2026 {config.nombre}. Todos los derechos reservados.
    </footer>
  )
}