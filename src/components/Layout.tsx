import { Suspense, type ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'
import FooterClinica from './FooterClinica'
import Navbar from './Navbar'

// Layout común (S12/S15): barra lateral fija + contenido cambiante (children) + footer
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="d-lg-flex min-vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <main className="p-3 p-lg-4 flex-grow-1">{children}</main>
        <div className="px-3 px-lg-4">
          <ErrorBoundary mensaje="No se pudo cargar la configuración de la clínica.">
            <Suspense fallback={<p className="text-center text-muted small py-3">Cargando configuración...</p>}>
              <FooterClinica />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}