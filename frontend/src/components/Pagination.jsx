import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPrev, onNext, onGoTo }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-600 text-sm font-mono">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onGoTo(p)}
            className={`w-8 h-8 rounded-lg text-sm font-mono transition-all duration-200 ${
              p === page
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/8'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
