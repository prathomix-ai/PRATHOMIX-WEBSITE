import React from 'react'
import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, label, color = 'brand', showPercent = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const COLORS = {
    brand: 'from-brand-400 to-teal-400',
    ink:   'from-ink-400 to-violet-400',
    amber: 'from-amber-400 to-orange-400',
    rose:  'from-rose-400 to-pink-400',
  }
  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${COLORS[color] ?? COLORS.brand}`}
        />
      </div>
    </div>
  )
}
