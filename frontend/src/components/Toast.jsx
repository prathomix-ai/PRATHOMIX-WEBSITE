import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle size={16} className="text-green-400 flex-shrink-0" />,
  error:   <XCircle    size={16} className="text-red-400   flex-shrink-0" />,
  info:    <Info       size={16} className="text-sky-400   flex-shrink-0" />,
}
const STYLES = {
  success: 'border-green-500/20 bg-green-500/10',
  error:   'border-red-500/20   bg-red-500/10',
  info:    'border-sky-500/20   bg-sky-500/10',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error',   dur),
    info:    (msg, dur) => add(msg, 'info',     dur),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto glass border ${STYLES[t.type]} rounded-xl px-4 py-3 flex items-center gap-3 min-w-[260px] max-w-sm shadow-xl`}
            >
              {ICONS[t.type]}
              <p className="text-sm text-white flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
