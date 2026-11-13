// Recursos locales para leer con use() + <Suspense>.
// IMPORTANTE: las promesas se crean UNA sola vez a nivel de módulo (estables).
// Si se crearan dentro del render, cada render generaría una promesa nueva
// y use() suspendería en bucle.

export interface Aviso {
  id: number
  tipo: 'info' | 'warning' | 'success'
  mensaje: string
}

export interface ConfigClinica {
  nombre: string
}

const simular = <T,>(valor: T, ms = 700) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(valor), ms))

export const avisosPromise: Promise<Aviso[]> = simular([
  { id: 1, tipo: 'info', mensaje: 'Campaña de vacunación antirrábica del 15 al 30 de noviembre.' },
  { id: 2, tipo: 'warning', mensaje: 'El sábado 21 la clínica atenderá solo emergencias.' },
  { id: 3, tipo: 'success', mensaje: 'Nuevo servicio disponible: desparasitación a domicilio.' },
])

export const configPromise: Promise<ConfigClinica> = simular(
  {
    nombre: 'Veterinaria',
  },
  400,
)
