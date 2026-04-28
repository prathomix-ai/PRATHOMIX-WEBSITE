import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, User, LayoutDashboard, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',         label: 'Home'     },
  { to: '/services', label: 'Services' },
  { to: '/products', label: 'Products' },
  { to: '/pricing',  label: 'Pricing'  },
  { to: '/founder',  label: 'Founder'  },
  { to: '/contact',  label: 'Contact'  },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const openPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5 shadow-2xl' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src="/logo.png"
            alt="PRATHOMIX logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-display font-bold text-lg tracking-tight text-white">PRATHOMIX</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                  isActive ? 'text-brand-300 bg-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={openPalette}
            className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/8 text-gray-500 hover:text-white hover:border-brand-500/30 transition-all duration-200 text-xs font-mono"
            title="Cmd+K"
          >
            <Search size={13} />
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden xl:inline bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5">
                  <LayoutDashboard size={13} /> Admin
                </Link>
              )}
              <Link to="/profile" className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5">
                <User size={13} /> Profile
              </Link>
              <button onClick={handleSignOut} className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 text-rose-400 border-rose-500/20 hover:border-rose-400/40">
                <LogOut size={13} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-xs py-2 px-3">Sign In</Link>
              <Link to="/register" className="btn-primary text-xs py-2 px-3">Get Started</Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm ${
                      isActive ? 'text-brand-300 bg-brand-500/10' : 'text-gray-300 hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)} className="btn-ghost text-center text-sm">Profile</Link>
                    <button onClick={handleSignOut} className="btn-ghost text-sm text-rose-400 border-rose-500/20">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    onClick={() => setOpen(false)} className="btn-ghost text-center text-sm">Sign In</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center text-sm">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
