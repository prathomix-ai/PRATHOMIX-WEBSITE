/**
 * Timeline — generic vertical timeline component.
 *
 * Usage:
 *   <Timeline items={[
 *     { date: '2025-01', title: 'Founded', desc: '...' },
 *   ]} />
 */
import React from 'react'
import { motion } from 'framer-motion'

export default function Timeline({ items = [], color = 'bg-brand-400' }) {
  return (
    <div className="relative pl-6 border-l border-white/8 space-y-8">
      {items.map(({ date, title, desc, icon: Icon }, i) => (
        <motion.div
          key={title + i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.08 }}
          className="relative"
        >
          <span className={`absolute -left-[25px] w-3 h-3 rounded-full ${color} border-2 border-gray-950`} />
          {date && <p className="text-xs font-mono text-gray-500 mb-0.5">{date}</p>}
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={14} className="text-brand-400 flex-shrink-0" />}
            <p className="font-display font-semibold text-white">{title}</p>
          </div>
          {desc && <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>}
        </motion.div>
      ))}
    </div>
  )
}
