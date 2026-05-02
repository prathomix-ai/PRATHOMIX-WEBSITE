import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const navigate = useNavigate()
  const { signInAdmin } = useAuth()

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'founder.prathomix@gmail.com'
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Prathomix@Admin2026'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (email === adminEmail && password === adminPassword) {
        await signInAdmin(email, password)
        navigate('/admin')
        return
      }

      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); return }
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetLoading(true)

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setMessage('Password reset link sent. Check your email and follow the link to set a new password.')
      setShowReset(false)
      setResetEmail('')
    } catch (err) {
      setError(err.message || 'Could not send reset email.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 glow-border">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center mb-4 shadow-xl shadow-brand-500/20">
              <Zap size={22} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your PRATHOMIX account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2 border-transparent border-t-white"
                />
              ) : 'Sign In'}
            </button>
          </form>

          {showReset ? (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleResetRequest}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Reset Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-transparent border-t-white"
                  />
                ) : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => { setShowReset(false); setError(''); setMessage('') }}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            </motion.form>
          ) : (
            <div className="mt-6 flex items-center justify-between gap-3 text-sm flex-wrap">
              <button
                type="button"
                onClick={() => { setShowReset(true); setError(''); setMessage('') }}
                className="text-brand-300 hover:text-brand-200 underline underline-offset-4 transition-colors"
              >
                Forgot password?
              </button>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-300 hover:text-brand-200 underline underline-offset-4 transition-colors">
                Create one
              </Link>
            </p>
          </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
