export interface Dueno {
  id: number
  nombre: string
  telefono: string
  email: string
}

export interface Mascota {
  id: number
  nombre: string
  especie: string
  raza: string
  duenoId: number
}

export interface Servicio {
  id: number
  nombre: string
  precio: number
}

export interface Cita {
  id: number
  fecha: string
  mascotaId: number
  servicioId: number
  estado: 'Pendiente' | 'Atendida' | 'Cancelada'
}
