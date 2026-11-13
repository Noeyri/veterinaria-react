import { useMutation } from '../hooks/useMutation'

interface DeleteButtonProps {
  label?: string
  confirmation: string
  onDelete: () => Promise<void>
  onDeleted: () => void
}

export default function DeleteButton({
  label = 'Eliminar',
  confirmation,
  onDelete,
  onDeleted,
}: DeleteButtonProps) {
  const { mutate, loading, error } = useMutation<void, void>(() => onDelete())

  const handleDelete = async () => {
    if (!window.confirm(confirmation)) return
    const result = await mutate()
    if (result !== null) onDeleted()
  }

  return (
    <span className="d-inline-flex flex-column align-items-start">
      <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDelete} disabled={loading}>
        {loading ? 'Eliminando...' : label}
      </button>
      {error && <span className="text-danger small mt-1" role="alert">{error.message}</span>}
    </span>
  )
}
