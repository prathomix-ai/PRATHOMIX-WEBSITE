import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)
const ADMIN_SESSION_KEY = 'prathomix_admin_session'
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'founder.prathomix@gmail.com'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Prathomix@Admin2026'

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

  const signInAdmin = async (email, password) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Invalid admin credentials.')
    }

    const adminUser = { email: ADMIN_EMAIL }
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser))
    } catch {}
    setUser(adminUser)
    setIsAdmin(true)
    return adminUser
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
