import { Link } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import DataTable from '../components/DataTable'
import DeleteButton from '../components/DeleteButton'
import { useSession } from '../context/SessionContext'
import { useFetch } from '../hooks/useFetch'
import { mascotasService } from '../services/mascotasService'
import { duenosService } from '../services/duenosService'

export default function Duenos() {
  const { usuario } = useSession()
  const puedeGestionar = usuario?.rol !== 'Veterinario'
  const { data, loading, error, reload } = useFetch(duenosService.getAll)
  const duenos = data ?? []

  const eliminarDueno = async (id: number) => {
    const mascotasActuales = await mascotasService.getAll()
    if (mascotasActuales.some((mascota) => mascota.duenoId === id)) {
      throw new Error('No se puede eliminar este dueño porque tiene mascotas asociadas. Elimina primero sus mascotas.')
    }
    await duenosService.delete(id)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Dueños</h1>
        {puedeGestionar && <Link to="/registro?tab=dueno" className="btn btn-success btn-sm">+ Nuevo dueño</Link>}
      </div>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        <DataTable title="Listado" headers={['#', 'Nombre', 'Teléfono', 'Email', ...(puedeGestionar ? ['Acciones'] : [])]}>
          {duenos.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.nombre}</td>
              <td>{d.telefono}</td>
              <td>{d.email}</td>
              {puedeGestionar && (
                <td className="text-end">
                  <div className="d-inline-flex gap-2 align-items-start">
                    <Link to={`/registro?tab=dueno&editar=${d.id}`} className="btn btn-outline-primary btn-sm">Editar</Link>
                    <DeleteButton
                      confirmation={`¿Eliminar al dueño ${d.nombre}?`}
                      onDelete={() => eliminarDueno(d.id)}
                      onDeleted={reload}
                    />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </DataTable>
      </AsyncState>
    </>
  )
}
