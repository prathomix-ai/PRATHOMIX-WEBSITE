import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Send, Cpu, User,
  Sparkles, RefreshCw, Zap, AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Session ID (per browser tab) ─────────────────────────────
const SESSION_ID = (() => {
  const KEY = 'mix_session_v3'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(KEY, id)
  }
  return id
})()

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '')

// ── Welcome message ───────────────────────────────────────────
const WELCOME = {
  id:   'welcome',
  role: 'bot',
  text: "Hello! I am **Mix**, your PRATHOMIX AI agent. I can help with AI services & products, technical architecture advice, founder info, contact details, and project scoping. What can I help you build today?",
}

// ── Minimal markdown renderer ─────────────────────────────────
function md(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code style="background:rgba(255,255,255,0.1);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:0.82em">$1</code>')
    .replace(/^[•\-] (.+)$/gm, '<span style="display:block;padding-left:1.1em;position:relative"><span style="position:absolute;left:0;color:#6ee7b7">•</span>$1</span>')
    .replace(/^(\d+)\. (.+)$/gm,'<span style="display:block;padding-left:1.5em;position:relative"><span style="position:absolute;left:0;color:#93c5fd">$1.</span>$2</span>')
    .replace(/\n{2,}/g,        '\n')
    .replace(/\n/g,             '<br/>')
}

// ── Typing dots ───────────────────────────────────────────────
function TypingDots() {
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

// ── Quick suggestion chips ────────────────────────────────────
const CHIPS = [
  'What can Mix do?',
  'Tell me about Travojo',
  'Get started',
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SmartBot() {
  const [open,       setOpen]       = useState(false)
  const [messages,   setMessages]   = useState([WELCOME])
  const [input,      setInput]      = useState('')
  const [streaming,  setStreaming]  = useState(false)
  const [waiting,    setWaiting]    = useState(false)   // before first token
  const [provider,   setProvider]   = useState(null)    // active AI provider
  const [showChips,  setShowChips]  = useState(true)
  const [offline,    setOffline]    = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef   = useRef(null)
  const { user }   = useAuth()

  // ── auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming, waiting])

  // ── focus on open ─────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  // ── cleanup ───────────────────────────────────────────────
  useEffect(() => () => abortRef.current?.abort(), [])

  // ── send ──────────────────────────────────────────────────
  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || streaming) return

    setInput('')
    setShowChips(false)

    // Append user message
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }])

    // Placeholder bot message
    const botId = Date.now() + 1
    setMessages(prev => [...prev, { id: botId, role: 'bot', text: '', isStreaming: true }])
    setWaiting(true)
    setStreaming(true)
    abortRef.current = new AbortController()

    let prevProvider = null

    try {
      const resp = await fetch(`${API_BASE}/api/chatbot/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:    text,
          session_id: SESSION_ID,
          user_id:    user?.id || null,
        }),
        signal: abortRef.current.signal,
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader  = resp.body.getReader()
      const decoder = new TextDecoder()
      let   buf     = ''
      let   curEvt  = 'token'

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          const l = line.trim()
          if (!l) { curEvt = 'token'; continue }

          if (l.startsWith('event: ')) {
            curEvt = l.slice(7)
            continue
          }

          if (l.startsWith('data: ')) {
            const raw = l.slice(6)

            // ── provider events ──────────────────────────
            if (curEvt === 'provider_start' || curEvt === 'provider_active') {
              try {
                const p = JSON.parse(raw).text
                setProvider(p)
                setWaiting(false)
                prevProvider = p
              } catch {}
              continue
            }

            if (curEvt === 'provider_switch') {
              try {
                const p = JSON.parse(raw).text
                setProvider(p)
                prevProvider = p
              } catch {}
              continue
            }

            // ── rule_response (no AI used) ────────────────
            if (curEvt === 'rule_response') {
              setProvider('rule')
              setWaiting(false)
              continue
            }

            // ── done event ────────────────────────────────
            if (curEvt === 'done') {
              setMessages(prev =>
                prev.map(m => m.id === botId ? { ...m, isStreaming: false } : m)
              )
              setOffline(false)
              continue
            }

            // ── token chunk ───────────────────────────────
            if (curEvt === 'token') {
              try {
                const chunk = JSON.parse(raw).text || ''
                if (chunk) {
                  setWaiting(false)
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === botId
                        ? { ...m, text: m.text + chunk }
                        : m
                    )
                  )
                }
              } catch {}
            }
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return
      setOffline(true)
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? {
                ...m,
                text: "I could not reach my AI engine right now.\n\n📧  prathomix@gmail.com",
                isStreaming: false,
                isError: true,
              }
            : m
        )
      )
    } finally {
      setStreaming(false)
      setWaiting(false)
    }
  }, [input, streaming, user])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const cancel = () => {
    abortRef.current?.abort()
    setStreaming(false)
    setWaiting(false)
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m))
  }

  const clearChat = () => {
    setMessages([WELCOME])
    setShowChips(true)
    setProvider(null)
    fetch(`${API_BASE}/api/chatbot/session/${SESSION_ID}`, { method: 'DELETE' }).catch(() => {})
  }

  // ── header status text ────────────────────────────────────
  const headerStatus = () => {
    if (offline)   return { text: 'Offline',    color: '#ef4444' }
    if (waiting)   return { text: 'Connecting…',color: '#f59e0b' }
    if (streaming) return { text: 'Typing…',    color: '#6ee7b7' }
    return           { text: 'PRATHOMIX AI Assistant', color: '#6b7280' }
  }
  const hs = headerStatus()

  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating button ──────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        animate={open ? {} : { scale: [1, 1.07, 1] }}
        transition={open ? {} : { repeat: Infinity, repeatDelay: 4, duration: 0.4 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
                   bg-gradient-to-br from-brand-400 to-ink-500
                   flex items-center justify-center
                   shadow-2xl shadow-brand-500/30"
        aria-label="Open Mix AI"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate:  90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                <X size={22} className="text-white" />
              </motion.div>
            : <motion.div key="m"
                initial={{ rotate:  90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                <MessageCircle size={22} className="text-white" />
              </motion.div>
          }
        </AnimatePresence>

        {/* Unread dot */}
        {!open && messages.length === 1 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full
                           border-2 border-gray-950 animate-pulse" />
        )}
        {/* Offline dot */}
        {offline && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full
                           border-2 border-gray-950" />
        )}
      </motion.button>

      {/* ── Chat window ──────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50
                       w-[370px] max-w-[calc(100vw-2rem)]
                       rounded-2xl overflow-hidden
                       shadow-2xl shadow-black/60"
            style={{ transformOrigin: 'bottom right' }}
          >

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-gradient-to-r from-brand-600/80 to-ink-700/80
                            backdrop-blur-xl border-b border-white/10
                            px-4 py-3 flex items-center gap-3">

              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-xl bg-white/10
                              flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-brand-200" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5
                                 bg-green-400 rounded-full border border-gray-950" />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-white">Mix</p>
                <p className="text-xs font-mono mt-0.5 transition-colors"
                   style={{ color: hs.color }}>
                  {hs.text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <button onClick={clearChat} title="Clear chat"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white
                             hover:bg-white/10 transition-colors">
                  <RefreshCw size={13} />
                </button>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white
                             hover:bg-white/10 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div className="h-80 overflow-y-auto bg-gray-950/95
                            backdrop-blur-xl p-4 space-y-3"
                 style={{ scrollbarWidth: 'thin' }}>

              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex
                                   items-center justify-center ${
                    msg.role === 'user' ? 'bg-ink-500/30' : 'bg-brand-500/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={13} className="text-ink-300" />
                      : <Cpu  size={13} className="text-brand-300" />
                    }
                  </div>

                  {/* Bubble */}
                  {msg.role === 'user' ? (
                    <div className="max-w-[84%] px-3.5 py-2 rounded-2xl rounded-tr-sm
                                    text-sm leading-snug
                                    bg-ink-600/30 text-white border border-ink-500/20">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[84%] px-3.5 py-2 rounded-2xl rounded-tl-sm
                                     text-sm leading-snug ${
                      msg.isError
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                        : 'bg-brand-500/10 text-gray-200 border border-brand-500/15'
                    }`}>
                      {msg.text
                        ? <span dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
                        : null
                      }
                      {/* Streaming cursor */}
                      {msg.isStreaming && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.55 }}
                          className="inline-block w-0.5 h-3.5 bg-brand-400 ml-0.5 align-middle"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing dots — waiting for first token */}
              {waiting && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-brand-500/20
                                  flex items-center justify-center flex-shrink-0">
                    <Cpu size={13} className="text-brand-300" />
                  </div>
                  <div className="bg-brand-500/10 border border-brand-500/15
                                  rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              {/* Quick chips */}
              {showChips && messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-1 flex flex-wrap gap-1.5"
                >
                  {CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => send(chip)}
                      className="text-xs font-mono px-3 py-1.5 rounded-full
                                 border border-brand-500/25 text-brand-300
                                 bg-brand-500/8 hover:bg-brand-500/15
                                 hover:border-brand-500/40
                                 transition-all duration-200"
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input bar ───────────────────────────────── */}
            <div className="bg-gray-950/95 backdrop-blur-xl
                            border-t border-white/5 p-3 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Mix anything…"
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl
                           px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-600
                           focus:outline-none focus:border-brand-500/50
                           focus:ring-1 focus:ring-brand-500/20
                           transition-all duration-200 max-h-28 overflow-y-auto
                           font-body disabled:opacity-50"
                style={{ scrollbarWidth: 'none' }}
              />

              {streaming ? (
                /* Cancel button */
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={cancel}
                  title="Cancel"
                  className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30
                             flex items-center justify-center flex-shrink-0
                             text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X size={15} />
                </motion.button>
              ) : (
                /* Send button */
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-ink-500
                             flex items-center justify-center flex-shrink-0
                             disabled:opacity-35 disabled:cursor-not-allowed
                             shadow-lg shadow-brand-500/20"
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              )}
            </div>

            {/* ── Footer ──────────────────────────────────── */}
            <div className="bg-gray-950/95 border-t border-white/5
                            px-4 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-700">
                Powered by <span className="text-brand-700 font-semibold">PRATHOMIX</span>
              </span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}