/**
 * AuroraBackground — CSS-only animated aurora effect.
 * Lighter than the canvas version. Good for inner pages.
 */
import React from 'react'
import { motion } from 'framer-motion'

export default function AuroraBackground({ intensity = 1 }) {
  const op = Math.min(1, intensity)
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 10, 0],
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(10,144,144,${0.18 * op}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -12, 0],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-1/4 -right-1/4 w-[65vw] h-[65vw] rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(64,64,184,${0.18 * op}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, -20, 0],
          y: [0, -40, 0],
        }}
        transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut', delay: 9 }}
        className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(139,92,246,${0.12 * op}) 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
