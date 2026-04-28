import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import SEO from '../components/SEO'

export default function ServerError({ code = 500, message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <SEO title={`${code} — Server Error`} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg space-y-6"
      >
        <div className="relative inline-block">
          <p className="font-display font-bold leading-none select-none"
             style={{
               fontSize: 'clamp(80px, 20vw, 140px)',
               background: 'linear-gradient(135deg, #e11d48, #f97316)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               filter: 'drop-shadow(0 0 40px rgba(225,29,72,0.35))',
             }}>
            {code}
          </p>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center"
          >
            <AlertTriangle size={18} className="text-rose-400" />
          </motion.div>
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
            {message || 'Something went wrong on our end'}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Our team has been notified. This is usually resolved within minutes.
            If it persists, please reach out to us directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} /> Reload Page
          </button>
          <Link to="/" className="btn-ghost flex items-center gap-2 text-sm">
            <Home size={14} /> Back to Home
          </Link>
          <a href="mailto:prathomix@gmail.com" className="btn-ghost flex items-center gap-2 text-sm">
            <Mail size={14} /> Contact Us
          </a>
        </div>

        <p className="text-xs font-mono text-gray-700">
          Error {code} · PRATHOMIX Platform
        </p>
      </motion.div>
    </div>
  )
}
