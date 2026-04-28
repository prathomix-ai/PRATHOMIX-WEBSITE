import React from 'react'
import { motion } from 'framer-motion'

const GLOW_MAP = {
  brand: 'hover:border-brand-500/40 hover:shadow-brand-500/20',
  ink:   'hover:border-ink-500/40   hover:shadow-ink-500/20',
  amber: 'hover:border-amber-500/40 hover:shadow-amber-500/20',
  rose:  'hover:border-rose-500/40  hover:shadow-rose-500/20',
  none:  '',
}

export default function GlassCard({
  children,
  className = '',
  glow = 'brand',
  hover = false,
  delay = 0,
  animate = true,
  rounded = 'rounded-2xl',
  padding = 'p-6',
  onClick,
}) {
  const glowClass = GLOW_MAP[glow] ?? GLOW_MAP.brand
  const hoverClass = hover
    ? `transition-all duration-300 hover:bg-white/8 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${glowClass}`
    : ''

  const inner = (
    <div
      onClick={onClick}
      className={`glass border border-white/8 ${rounded} ${padding} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )

  if (!animate) return inner

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  )
}
