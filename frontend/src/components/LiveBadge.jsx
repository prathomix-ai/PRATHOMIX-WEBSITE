/**
 * LiveBadge — shows a pulsing green dot + "N users online"
 * using Supabase Presence.
 */
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LiveBadge({ room = 'global' }) {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const channel = supabase.channel(`presence:${room}`, {
      config: { presence: { key: `user_${Math.random().toString(36).slice(2, 8)}` } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length || 1)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => supabase.removeChannel(channel)
  }, [room])

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      {count} online
    </span>
  )
}
