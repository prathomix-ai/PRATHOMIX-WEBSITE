import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Zap } from 'lucide-react'
import SEO from '../components/SEO'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <SEO title="404 — Page Not Found" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 max-w-lg"
      >
        {/* Glowing 404 */}
        <div className="relative inline-block">
          <p className="font-display font-bold text-[120px] md:text-[160px] leading-none select-none"
             style={{
               background: 'linear-gradient(135deg, #0a9090 0%, #4040b8 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               filter: 'drop-shadow(0 0 40px rgba(13,148,148,0.4))',
             }}>
            404
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="absolute -top-4 -right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center shadow-lg shadow-brand-500/30"
          >
            <Zap size={18} className="text-white" />
          </motion.div>
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
            This page got lost in the matrix
          </h1>
          <p className="text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist, was moved, or you may have
            mistyped the URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={16} /> Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <p className="text-xs font-mono text-gray-600">
          Error 404 · PRATHOMIX Platform
        </p>
      </motion.div>
    </div>
  )
}
