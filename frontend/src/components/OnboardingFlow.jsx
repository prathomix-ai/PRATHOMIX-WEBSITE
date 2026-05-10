import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Bot, Layers, Check, ArrowRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  {
    icon: Zap,
    title: 'Welcome to PRATHOMIX!',
    desc: "You are now part of an elite circle of builders who use AI to get things done faster. Let us take 60 seconds to set you up.",
    color: 'from-brand-400 to-teal-400',
    cta: 'Get Started',
  },
  {
    icon: Bot,
    title: 'Meet SmartBot',
    desc: "See that floating icon in the bottom-right corner? That is SmartBot — your 24/7 AI assistant. Ask it about our services, describe a business problem, or say hello!",
    color: 'from-ink-400 to-violet-400',
    cta: 'Got it',
  },
  {
    icon: Layers,
    title: 'Explore Our Products',
    desc: "We are building AI-powered tools including Mix AI (chatbot engine), FlowMind (automation), and InsightAI (data). Check the Products page to see what is live.",
    color: 'from-amber-400 to-orange-400',
    cta: 'Explore Now',
  },
]

const ONBOARDING_KEY = 'prathomix_onboarded_v1'

export default function OnboardingFlow() {
  const { user } = useAuth()
  const [step, setStep]       = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      const t = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(t)
    }
  }, [user])

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  const s    = STEPS[step]
  const Icon = s.icon

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md glass border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
          >
            <button
              onClick={finish}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-brand-400' : i < step ? 'w-4 bg-brand-600' : 'w-4 bg-white/10'
                }`} />
              ))}
            </div>

            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} p-0.5 mx-auto mb-6`}>
              <div className="w-full h-full rounded-[14px] bg-gray-950/80 flex items-center justify-center">
                <Icon size={30} className="text-white" />
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl text-white mb-3">{s.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{s.desc}</p>

            <button onClick={next} className="btn-primary w-full flex items-center justify-center gap-2">
              {s.cta}
              {step < STEPS.length - 1 ? <ArrowRight size={16} /> : <Check size={16} />}
            </button>

            <p className="text-xs font-mono text-gray-600 mt-4">
              Step {step + 1} of {STEPS.length}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
