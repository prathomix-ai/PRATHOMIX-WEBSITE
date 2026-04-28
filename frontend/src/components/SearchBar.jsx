/**
 * SearchBar — debounced search input with loading indicator.
 *
 * Usage:
 *   <SearchBar
 *     placeholder="Search projects..."
 *     onSearch={(q) => setQuery(q)}
 *     debounceMs={400}
 *   />
 */
import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Loader } from 'lucide-react'

export default function SearchBar({
  placeholder = 'Search…',
  onSearch,
  debounceMs = 350,
  loading = false,
  className = '',
}) {
  const [value, setValue] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch?.(value.trim())
    }, debounceMs)
    return () => clearTimeout(timerRef.current)
  }, [value, debounceMs, onSearch])

  const clear = () => { setValue(''); onSearch?.('') }

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
        {loading ? (
          <Loader size={14} className="text-gray-500 animate-spin" />
        ) : value ? (
          <button onClick={clear} className="text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
