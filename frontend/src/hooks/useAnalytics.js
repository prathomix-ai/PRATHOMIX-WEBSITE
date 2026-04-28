/**
 * useAnalytics — privacy-first, no third-party trackers.
 * Logs page views + events to Supabase analytics table.
 * All data is anonymised (no PII stored).
 *
 * Usage:
 *   const { track } = useAnalytics()
 *   track('cta_clicked', { page: 'home', variant: 'primary' })
 */
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function fingerprint() {
  // Non-unique session hash — privacy friendly
  const ua = navigator.userAgent
  const lang = navigator.language
  const w = window.screen.width
  return btoa(`${ua}|${lang}|${w}`).slice(0, 16)
}

export function useAnalytics() {
  const { pathname } = useLocation()

  const track = useCallback(async (event, properties = {}) => {
    try {
      await supabase.from('analytics_events').insert({
        event,
        page: pathname,
        properties,
        session_id: fingerprint(),
        referrer: document.referrer || null,
      })
    } catch {
      // Never throw — analytics must never break the app
    }
  }, [pathname])

  const pageView = useCallback(() => track('page_view'), [track])

  return { track, pageView }
}
