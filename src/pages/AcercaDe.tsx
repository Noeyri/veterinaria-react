import { useRequest } from 'alova/client'
import { alovaClient } from '../services/alova'
import type { Servicio } from '../types'

export default function AcercaDe() {
  const { data: servicios, loading, error, send } = useRequest(
    alovaClient.Get<Servicio[]>('/servicios'),
  )

  return (
    <>
      <h1 className="h3 mb-3">Acerca de</h1>
      <p>
        <strong>Veterinaria</strong> es una SPA para gestionar dueños, mascotas, citas y
        servicios de una clínica veterinaria.
      </p>
      <ul>
        <li>React 19 + TypeScript</li>
        <li>Vite como herramienta de build</li>
        <li>Bootstrap 5 para los estilos</li>
        <li>react-router-dom para la navegación</li>
        <li>Context API (<code>useContext</code>) para tema y sesión</li>
        <li><code>use()</code> + Suspense para avisos y configuración</li>
        <li>Axios como cliente HTTP y Alova como estrategia de peticiones con React</li>
        <li><code>FormData</code> para leer los campos de formularios al enviarlos</li>
      </ul>

      <section className="card card-body shadow-sm mt-4" aria-labelledby="alova-demo-title">
        <h2 id="alova-demo-title" className="h5">Catálogo cargado con Alova</h2>
        {loading && <p role="status" className="mb-0">Cargando servicios...</p>}
        {error && (
          <div className="alert alert-danger mb-0" role="alert">
            <p>{error.message}</p>
            <button type="button" className="btn btn-outline-danger" onClick={() => void send()}>
              Reintentar
            </button>
          </div>
        )}
        {servicios && (
          <ul className="mb-0">
            {servicios.map((servicio) => (
              <li key={servicio.id}>{servicio.nombre} — S/ {servicio.precio.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}