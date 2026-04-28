import React from 'react'
import { motion } from 'framer-motion'
import CountUp from './CountUp'

export default function StatCard({ icon: Icon, value, suffix = '', prefix = '', label, color = 'text-brand-400', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-6 text-center group hover:border-white/15 transition-all duration-300"
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/8 transition-colors`}>
            <Icon size={20} className={color} />
          </div>
        </div>
      )}
      <p className={`font-display font-bold text-3xl md:text-4xl ${color}`}>
        <CountUp end={typeof value === 'number' ? value : 0} suffix={suffix} prefix={prefix} />
        {typeof value === 'string' ? value : ''}
      </p>
      <p className="text-xs font-mono text-gray-500 mt-2 uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}
