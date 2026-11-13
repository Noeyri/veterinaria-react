// Punto de entrada único de la capa de servicios.
export { ApiError, http } from './http'
export { citasService } from './citasService'
export { duenosService } from './duenosService'
export { mascotasService } from './mascotasService'
export { serviciosService } from './serviciosService'
export { avisosPromise, configPromise } from './sistemaService'
export type { Aviso, ConfigClinica } from './sistemaService'
