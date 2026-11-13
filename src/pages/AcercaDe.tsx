export default function AcercaDe() {
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
        <li>Capa de servicios con Fetch API (GET y POST) y estados loading / data / error</li>
      </ul>
    </>
  )
}