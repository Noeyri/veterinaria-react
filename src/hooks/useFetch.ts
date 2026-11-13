import { useCallback, useEffect, useState, type DependencyList } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/** GET: ejecuta la petición al montar (y cuando cambian las deps). */
export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelado) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelado)
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('Error desconocido'),
          })
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intento])

  const reload = useCallback(() => setIntento((n) => n + 1), [])

  return { ...state, reload }
}
