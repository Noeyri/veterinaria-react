import { createContext, useContext, useState, type ReactNode } from 'react'

export type FiltroEspecie = 'Todas' | 'Perro' | 'Gato' | 'Ave' | 'Otro'

interface FiltroContextValue {
  filtroEspecie: FiltroEspecie
  setFiltroEspecie: (valor: FiltroEspecie) => void
}

const FiltroContext = createContext<FiltroContextValue | null>(null)

// Estado compartido pequeño (S15): el filtro sobrevive al navegar entre páginas
export function FiltroProvider({ children }: { children: ReactNode }) {
  const [filtroEspecie, setFiltroEspecie] = useState<FiltroEspecie>('Todas')
  return (
    <FiltroContext.Provider value={{ filtroEspecie, setFiltroEspecie }}>{children}</FiltroContext.Provider>
  )
}

export function useFiltro() {
  const ctx = useContext(FiltroContext)
  if (!ctx) throw new Error('useFiltro debe usarse dentro de <FiltroProvider>')
  return ctx
}