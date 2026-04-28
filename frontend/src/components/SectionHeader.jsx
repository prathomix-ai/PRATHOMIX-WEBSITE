import React from 'react'
import { motion } from 'framer-motion'

export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  highlightAfter = false,
  subtitle,
  center = true,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`mb-14 ${center ? 'text-center' : ''}`}
    >
      {eyebrow && <span className="tag mb-4 inline-flex">{eyebrow}</span>}
      <h2 className="section-heading">
        {highlightAfter ? (
          <>
            <span className="text-white">{title} </span>
            <span className="text-gradient">{highlight}</span>
          </>
        ) : (
          <>
            <span className="text-gradient">{highlight} </span>
            <span className="text-white">{title}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
