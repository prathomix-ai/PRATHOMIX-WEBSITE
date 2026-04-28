import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Cpu, Code2, Layers, BarChart2, Shield, Workflow } from 'lucide-react'

const SERVICES = [
  {
    icon: Cpu,
    title: 'AI Chatbot Development',
    problem: 'Support replies are slow and inconsistent.',
    solution: 'We build AI chatbots that answer common questions and hand off to a person when needed.',
    tags: ['Groq LLaMA 3', 'Gemini Pro', 'NLP', 'FastAPI'],
    color: 'from-brand-400 to-teal-400',
  },
  {
    icon: Workflow,
    title: 'Process Automation & AI Workflows',
    problem: 'Manual tasks waste time every week.',
    solution: 'We automate repeated steps with simple workflows and AI.',
    tags: ['Python', 'n8n', 'Zapier', 'Webhooks'],
    color: 'from-ink-400 to-violet-400',
  },
  {
    icon: Code2,
    title: 'Full-Stack SaaS Product Development',
    problem: 'You have an idea but no product yet.',
    solution: 'We build the full SaaS app from MVP to launch.',
    tags: ['React', 'FastAPI', 'Supabase', 'AWS'],
    color: 'from-amber-400 to-orange-400',
  },
  {
    icon: BarChart2,
    title: 'AI Analytics & Business Intelligence',
    problem: 'Your data is messy and hard to use.',
    solution: 'We connect data and show clear dashboards with useful insights.',
    tags: ['Pandas', 'Plotly', 'OpenAI', 'Postgres'],
    color: 'from-rose-400 to-pink-400',
  },
  {
    icon: Layers,
    title: 'API Integration & System Architecture',
    problem: "Your tools don't connect well.",
    solution: 'We build APIs and integrations so systems work together.',
    tags: ['REST', 'GraphQL', 'Microservices', 'Docker'],
    color: 'from-emerald-400 to-cyan-400',
  },
  {
    icon: Shield,
    title: 'Security Audit & Hardening',
    problem: 'You are not sure if your system is secure.',
    solution: 'We review security basics and fix the biggest risks.',
    tags: ['OWASP', 'Penetration Testing', 'JWT', 'TLS'],
    color: 'from-yellow-400 to-lime-400',
  },
]

function ServiceCard({ service, index }) {
  const [open, setOpen] = useState(false)
  const Icon = service.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-6 text-left group hover:bg-white/3 transition-colors duration-200"
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.color} bg-opacity-15 flex-shrink-0 flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-white group-hover:text-brand-300 transition-colors">{service.title}</p>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{service.problem}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 text-gray-500"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/5 pt-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-red-500/10">
                  <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2">❌  The Problem</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{service.problem}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-brand-500/10">
                  <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">✅  PRATHOMIX Fix</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{service.solution}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {service.tags.map(tag => (
                  <span key={tag} className="tag text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Services() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex">What We Do</span>
          <h1 className="section-heading mb-4">
            Services That{' '}
            <span className="text-gradient">Solve Real</span>{' '}
            Problems
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tap any service to see the problem and our fix.
          </p>
        </motion.div>

        <div className="space-y-4">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass rounded-2xl p-8 text-center"
        >
          <p className="text-gray-300 mb-2">Have a custom requirement?</p>
          <a href="mailto:prathomix@gmail.com" className="text-brand-300 hover:text-brand-200 font-mono text-sm underline underline-offset-4 transition-colors">
            prathomix@gmail.com
          </a>
        </motion.div>
      </div>
    </div>
  )
}
