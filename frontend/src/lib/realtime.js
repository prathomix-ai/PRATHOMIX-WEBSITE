/**
 * Supabase real-time channel helpers.
 *
 * Usage:
 *   import { subscribeToChatLogs } from '../lib/realtime'
 *
 *   useEffect(() => {
 *     const unsub = subscribeToChatLogs((payload) => {
 *       console.log('New log:', payload.new)
 *     })
 *     return () => unsub()
 *   }, [])
 */
import { supabase } from './supabaseClient'

/**
 * Subscribe to INSERT events on chatbot_logs.
 * Returns an unsubscribe function.
 */
export function subscribeToChatLogs(callback) {
  const channel = supabase
    .channel('chatbot_logs_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chatbot_logs' },
      callback
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Subscribe to all changes on a given table.
 */
export function subscribeToTable(table, callback, event = '*') {
  const channel = supabase
    .channel(`${table}_realtime_${Date.now()}`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table },
      callback
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Subscribe to presence — useful for showing "X users online".
 */
export function usePresenceChannel(roomId, userMeta = {}) {
  const channel = supabase.channel(`presence:${roomId}`, {
    config: { presence: { key: userMeta.id || 'anon' } },
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track(userMeta)
    }
  })

  return {
    channel,
    getPresenceState: () => channel.presenceState(),
    unsubscribe: () => supabase.removeChannel(channel),
  }
}
