import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Home, Layers, Zap, User, Mail,
  LayoutDashboard, BookOpen, Star, Code2,
  Shield, FileText, DollarSign
} from 'lucide-react'

const COMMANDS = [
  { label: 'Home',           icon: Home,          to: '/'            },
  { label: 'Services',       icon: Zap,           to: '/services'    },
  { label: 'Products',       icon: Layers,        to: '/products'    },
  { label: 'Pricing',        icon: DollarSign,    to: '/pricing'     },
  { label: 'Case Studies',   icon: Star,          to: '/case-studies'},
  { label: 'Blog',           icon: BookOpen,      to: '/blog'        },
  { label: 'Founder',        icon: User,          to: '/founder'     },
  { label: 'Contact',        icon: Mail,          to: '/contact'     },
  { label: 'API Docs',       icon: Code2,         to: '/api-docs'    },
  { label: 'Privacy Policy', icon: Shield,        to: '/privacy'     },
  { label: 'Terms of Use',   icon: FileText,      to: '/terms'       },
  { label: 'Sign In',        icon: User,          to: '/login'       },
  { label: 'Create Account', icon: User,          to: '/register'    },
  { label: 'My Profile',     icon: User,          to: '/profile'     },
  { label: 'Settings',       icon: User,          to: '/settings'    },
  { label: 'Admin Dashboard',icon: LayoutDashboard,to: '/admin'      },
]

export default function CommandPalette() {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [sel, setSel]     = useState(0)
  const inputRef          = useRef(null)
  const navigate          = useNavigate()

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const execute = (cmd) => { setOpen(false); navigate(cmd.to) }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[sel]) execute(filtered[sel])
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.94, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-xl glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
              <Search size={18} className="text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSel(0) }}
                onKeyDown={handleKey}
                placeholder="Search pages and features…"
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none font-body"
              />
              <kbd className="text-xs font-mono text-gray-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-6 font-mono">No results for "{query}"</p>
              )}
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.to + cmd.label}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSel(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                      i === sel ? 'bg-brand-500/15 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={15} className={i === sel ? 'text-brand-400' : 'text-gray-500'} />
                    <span className="text-sm flex-1">{cmd.label}</span>
                    {i === sel && (
                      <kbd className="text-xs font-mono text-gray-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">↵</kbd>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs font-mono text-gray-600">
              <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
