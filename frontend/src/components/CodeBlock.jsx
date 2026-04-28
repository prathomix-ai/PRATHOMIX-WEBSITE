/**
 * CodeBlock — syntax-highlighted code display with copy button.
 * No external syntax highlighting lib — uses CSS class approach.
 *
 * Usage:
 *   <CodeBlock language="python" code={`print("hello")`} />
 */
import React from 'react'
import CopyButton from './CopyButton'

export default function CodeBlock({ code, language = 'bash', title, className = '' }) {
  return (
    <div className={`glass rounded-2xl overflow-hidden border border-white/8 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          {title && (
            <span className="text-xs font-mono text-gray-500 ml-2">{title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-600 uppercase">{language}</span>
          <CopyButton text={code} />
        </div>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
