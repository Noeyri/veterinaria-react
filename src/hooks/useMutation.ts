import { useCallback, useState } from 'react'
import type { AsyncState } from './useFetch'

/** POST (u otra escritura): se dispara manualmente con mutate(). */
export function useMutation<TArgs, TResult>(action: (args: TArgs) => Promise<TResult>) {
  const [state, setState] = useState<AsyncState<TResult>>({ data: null, loading: false, error: null })

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult | null> => {
      setState({ data: null, loading: true, error: null })
      try {
        const data = await action(args)
        setState({ data, loading: false, error: null })
        return data
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error('Error desconocido'),
        })
        return null
      }
    },
    [action],
  )

  return { ...state, mutate }
}
