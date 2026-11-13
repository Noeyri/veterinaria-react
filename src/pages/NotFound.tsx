import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold text-success">404</h1>
      <p className="lead">
        No encontramos la página <code>{pathname}</code>.
      </p>
      <Link to="/" className="btn btn-success">Volver al inicio</Link>
    </div>
  )
}