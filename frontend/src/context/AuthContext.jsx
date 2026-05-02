import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)
const ADMIN_SESSION_KEY = 'prathomix_admin_session'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get current session safely
    const init = async () => {
      try {
        const adminSession = localStorage.getItem(ADMIN_SESSION_KEY)
        if (adminSession) {
          const parsed = JSON.parse(adminSession)
          if (parsed?.email) {
            if (!mounted) return
            setUser({ email: parsed.email })
            setIsAdmin(true)
            setLoading(false)
            return
          }
        }

        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        const u = data?.session?.user ?? null
        setUser(u)
        setIsAdmin(u?.email === import.meta.env.VITE_ADMIN_EMAIL || u?.email === 'founder.prathomix@gmail.com')
      } catch (err) {
        console.warn('[AuthContext] getSession error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Listen for auth state changes safely
    let subscription = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        setIsAdmin(u?.email === import.meta.env.VITE_ADMIN_EMAIL || u?.email === 'founder.prathomix@gmail.com')
        setLoading(false)
      })
      subscription = data?.subscription
    } catch (err) {
      console.warn('[AuthContext] onAuthStateChange error:', err)
      setLoading(false)
    }

    return () => {
      mounted = false
      try { subscription?.unsubscribe() } catch {}
    }
  }, [])

  const signOut = async () => {
    try { await supabase.auth.signOut() } catch {}
    try { localStorage.removeItem(ADMIN_SESSION_KEY) } catch {}
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
