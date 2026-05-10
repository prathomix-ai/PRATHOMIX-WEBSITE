/**
 * AlertBanner — dismissible top-of-page announcement strip.
 * Add inside App.jsx above <Navbar /> for site-wide notices.
 *
 * Usage:
 *   <AlertBanner
 *     message="🚀 NexusBot 2.0 is live — check it out!"
 *     href="/products"
 *     storageKey="banner_nexusbot_v2"
 *   />
 */
import React, { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'

export default function AlertBanner({ message, href, storageKey }) { 
  const [visible, setVisible] = useState(() => {
    if (!storageKey) return true
    return !localStorage.getItem(storageKey)
  })

  const dismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-brand-600/90 to-ink-700/90 backdrop-blur-sm border-b border-white/10 py-2 px-4 flex items-center justify-center gap-3 text-sm text-white">
      <span>{message}</span>
      {href && (
        <a href={href} className="flex items-center gap-1 underline underline-offset-4 hover:text-brand-200 transition-colors font-medium">
          Learn more <ArrowRight size={12} />
        </a>
      )}
      <button
        onClick={dismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
