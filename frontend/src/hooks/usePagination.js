/**
 * usePagination — manages page state for paginated lists.
 *
 * Usage:
 *   const { page, limit, offset, next, prev, reset, totalPages } =
 *     usePagination({ total: 100, limit: 10 })
 */
import { useState, useMemo } from 'react'

export function usePagination({ total = 0, limit = 10, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const offset     = useMemo(() => (page - 1) * limit, [page, limit])

  const next  = () => setPage(p => Math.min(p + 1, totalPages))
  const prev  = () => setPage(p => Math.max(p - 1, 1))
  const goTo  = (n) => setPage(Math.max(1, Math.min(n, totalPages)))
  const reset = () => setPage(1)

  return { page, limit, offset, totalPages, next, prev, goTo, reset }
}
