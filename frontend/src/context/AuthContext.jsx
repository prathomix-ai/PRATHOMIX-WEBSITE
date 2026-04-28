import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get current session safely
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        const u = data?.session?.user ?? null
        setUser(u)
        setIsAdmin(u?.email === 'founder.prathomix@gmail.com')
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
        setIsAdmin(u?.email === 'founder.prathomix@gmail.com')
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
