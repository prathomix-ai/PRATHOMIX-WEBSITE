import React from 'react'

const VARIANTS = {
  default: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
  success: 'bg-green-500/10  text-green-300  border-green-500/20',
  warning: 'bg-amber-500/10  text-amber-300  border-amber-500/20',
  error:   'bg-red-500/10    text-red-300    border-red-500/20',
  info:    'bg-sky-500/10    text-sky-300    border-sky-500/20',
  ink:     'bg-ink-500/10    text-ink-300    border-ink-500/20',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
