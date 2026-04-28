/**
 * FeatureGrid — renders a grid of feature tiles with icon,
 * title, and description. Used on Home, Products, and Pricing.
 *
 * Usage:
 *   <FeatureGrid features={[{ icon: Zap, title: '...', desc: '...' }]} />
 */
import React from 'react'
import { motion } from 'framer-motion'

export default function FeatureGrid({ features = [], columns = 3 }) {
  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 xl:grid-cols-4',
  }[columns] || 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-5`}>
      {features.map(({ icon: Icon, title, desc, color = 'text-brand-400', tag }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          className="glass rounded-2xl p-5 hover:bg-white/6 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-white/8 flex items-center justify-center flex-shrink-0 transition-colors">
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-display font-semibold text-white text-sm">{title}</p>
                {tag && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20">
                    {tag}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
