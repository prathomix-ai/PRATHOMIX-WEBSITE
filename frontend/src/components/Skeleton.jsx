/**
 * Skeleton — shimmer loading placeholders.
 *
 * Usage:
 *   <Skeleton className="h-6 w-48" />
 *   <Skeleton.Card />
 *   <Skeleton.Text lines={3} />
 */
import React from 'react'

function Base({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        }}
      />
    </div>
  )
}

function Card() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Base className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Base className="h-4 w-32" />
          <Base className="h-3 w-20" />
        </div>
      </div>
      <Base className="h-3 w-full" />
      <Base className="h-3 w-5/6" />
      <Base className="h-3 w-4/6" />
    </div>
  )
}

function Text({ lines = 3, className = '' }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3']
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Base key={i} className={`h-3 ${widths[i % widths.length]}`} />
      ))}
    </div>
  )
}

Base.Card = Card
Base.Text = Text

export default Base
