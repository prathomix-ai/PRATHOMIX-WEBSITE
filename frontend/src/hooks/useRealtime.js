/**
 * useRealtime — subscribe to a Supabase table and keep local
 * state in sync with INSERT / UPDATE / DELETE events.
 *
 * Usage:
 *   const { rows, status } = useRealtime('chatbot_logs', {
 *     initialRows: [],
 *     event: 'INSERT',
 *     filter: 'resolved=eq.false',
 *   })
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRealtime(table, {
  initialRows = [],
  event = '*',
  filter,
  limit = 100,
  orderBy = 'created_at',
  ascending = false,
} = {}) {
  const [rows, setRows]     = useState(initialRows)
  const [status, setStatus] = useState('connecting')   // connecting | live | error

  const fetchInitial = useCallback(async () => {
    let q = supabase.from(table).select('*').order(orderBy, { ascending }).limit(limit)
    if (filter) q = q.filter(...filter.split('='))
    const { data, error } = await q
    if (error) { setStatus('error'); return }
    setRows(data || [])
  }, [table, orderBy, ascending, limit, filter])

  useEffect(() => {
    fetchInitial()

    const channel = supabase
      .channel(`${table}:realtime:${Date.now()}`)
      .on('postgres_changes', { event, schema: 'public', table }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRows(r => [payload.new, ...r].slice(0, limit))
        } else if (payload.eventType === 'UPDATE') {
          setRows(r => r.map(row => row.id === payload.new.id ? payload.new : row))
        } else if (payload.eventType === 'DELETE') {
          setRows(r => r.filter(row => row.id !== payload.old.id))
        }
      })
      .subscribe((s) => {
        setStatus(s === 'SUBSCRIBED' ? 'live' : s === 'CHANNEL_ERROR' ? 'error' : 'connecting')
      })

    return () => supabase.removeChannel(channel)
  }, [table, event, limit, fetchInitial])

  return { rows, status, refetch: fetchInitial }
}
