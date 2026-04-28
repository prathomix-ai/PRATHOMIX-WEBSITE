import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Founder, FinEdge Startup',
    avatar: 'AM',
    rating: 5,
    text: 'PRATHOMIX delivered our chatbot in 2 weeks. Support tickets dropped by 60% in the first month.',
  },
  {
    name: 'Sneha Kapoor',
    role: 'Operations Head, RetailCo',
    avatar: 'SK',
    rating: 5,
    text: 'We needed automation for CRM, WhatsApp, and inventory. PRATHOMIX built it and stayed responsive.',
  },
  {
    name: 'Rahul Sharma',
    role: 'CTO, HealthTrack SaaS',
    avatar: 'RS',
    rating: 5,
    text: 'They shaped our backend from day one with FastAPI, Supabase, and AI integration.',
  },
  {
    name: 'Priya Nair',
    role: 'Product Manager, EdTech Platform',
    avatar: 'PN',
    rating: 5,
    text: 'SmartBot now handles 500+ student questions every day with context from our catalog.',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const [dir, setDir]       = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setDir(1)
      setActive(a => (a + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const go = (i) => {
    setDir(i > active ? 1 : -1)
    setActive(i)
  }
  const prev = () => go((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => go((active + 1) % TESTIMONIALS.length)

  const t = TESTIMONIALS[active]

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <span className="tag mb-4 inline-flex"><Star size={10} /> Client Stories</span>
        <h2 className="section-heading text-3xl md:text-4xl">
          What Clients <span className="text-gradient">Say</span>
        </h2>
      </div>

      <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[280px] flex flex-col justify-between">
        <Quote size={48} className="absolute top-6 right-8 text-white/5" />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <div className="flex gap-1 mb-5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-gray-200 text-lg leading-relaxed mb-8 font-body">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="font-display font-semibold text-white text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 font-mono">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-brand-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
