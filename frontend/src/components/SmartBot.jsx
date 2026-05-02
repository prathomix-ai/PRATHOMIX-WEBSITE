import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Cpu, User, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  text: "Hello! Welcome to PRATHOMIX. I am your AI assistant. How can I help you scale your business or answer questions about our tools today?",
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-brand-400"
        />
      ))}
    </div>
  )
}

export default function SmartBot() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const sessionIdRef = useRef(
    (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
  )
  const { user }  = useAuth()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    const history = messages
      .filter(msg => msg.id !== 'welcome' && !msg.isError)
      .slice(-6)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }))

    try {
      let userId = user?.id || null
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        userId = sessionData?.session?.user?.id || userId
      } catch {}

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          history,
          session_id: sessionIdRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error(`Chatbot request failed with status ${response.status}`)
      }

      const data = await response.json()
      const botMsg = { id: Date.now() + 1, role: 'bot', text: data.response }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: 'I could not reach Mix right now. Please try again in a moment, or contact us through the Contact page.',
        isError: true,
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setThinking(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        animate={open ? { scale: 1, rotate: 0 } : { scale: [1, 1.08, 1], rotate: 0 }}
        transition={open ? {} : { repeat: Infinity, repeatDelay: 3, duration: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center shadow-2xl shadow-brand-500/30"
        aria-label="Open SmartBot"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="open"  initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
        {!open && messages.length === 1 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600/80 to-ink-700/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-brand-200" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-white">Mix</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow" />
                  <p className="text-xs text-gray-300 font-mono">PRATHOMIX AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto bg-gray-950/95 backdrop-blur-xl p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-ink-500/30' : 'bg-brand-500/20'
                  }`}>
                    {msg.role === 'user' ? <User size={13} className="text-ink-300" /> : <Cpu size={13} className="text-brand-300" />}
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-ink-600/30 text-white rounded-tr-sm border border-ink-500/20'
                      : msg.isError
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-tl-sm'
                        : 'bg-brand-500/10 text-gray-200 border border-brand-500/15 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center bg-brand-500/20">
                    <Cpu size={13} className="text-brand-300" />
                  </div>
                  <div className="bg-brand-500/10 border border-brand-500/15 rounded-2xl rounded-tl-sm">
                    <ThinkingDots />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-gray-950/95 backdrop-blur-xl border-t border-white/5 p-3 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about PRATHOMIX…"
                rows={1}
                className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all duration-200 max-h-28 overflow-y-auto font-body"
                style={{ scrollbarWidth: 'none' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
              >
                <Send size={15} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
