/**
 * useFetch — lightweight data fetching hook with loading,
 * error, and refetch support. Uses axios under the hood.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/api/projects/')
 *
 *   const { data } = useFetch('/api/projects/', {
 *     params: { limit: 5 },
 *     deps: [userId],          // re-fetch when userId changes
 *     enabled: !!userId,       // only fetch when true
 *     transform: d => d.projects,
 *   })
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'

export function useFetch(url, {
  params = {},
  deps = [],
  enabled = true,
  transform = (d) => d,
  initialData = null,
} = {}) {
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError]     = useState(null)
  const abortRef              = useRef(null)

  const fetch = useCallback(async () => {
    if (!enabled || !url) { setLoading(false); return }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const { data: raw } = await api.get(url, {
        params,
        signal: abortRef.current.signal,
      })
      setData(transform(raw))
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError(err?.response?.data?.detail || err.message || 'Request failed')
      }
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, JSON.stringify(params), ...deps])

  useEffect(() => {
    fetch()
    return () => abortRef.current?.abort()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
