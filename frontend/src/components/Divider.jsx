import React from 'react'

export default function Divider({ label, className = '' }) {
  if (!label) return <hr className={`border-white/5 my-8 ${className}`} />
  return (
    <div className={`flex items-center gap-4 my-8 ${className}`}>
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}
