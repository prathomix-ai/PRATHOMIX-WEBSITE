import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Clock, Star, ArrowRight, ChevronDown, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const CASES = [
  {
    id: 'Prathomix Resto',
    company: 'Prathomix Resto (Beta Benchmark)',
    industry: 'Next-Gen Restaurant AI',
    logo: 'FE',
    color: 'from-brand-400 to-teal-400',
    challenge: 'Traditional POS systems slow down during peak hours and lack intelligent, real-time automated ordering.',
    solution: 'Engineered a high-concurrency AI ordering system capable of handling voice requests, QR split-billing, and seamless CRM sync without latency.',
    results: [
      { label: 'Bot Response Time', value: '<2s', detail: 'using Groq routing' },
      { label: 'Simulated Load', value: '500+', detail: 'concurrent requests' },
      { label: 'Voice Accuracy', value: '98%', detail: 'in noisy test environments' },
      { label: 'System Uptime', value: '99.9%', detail: 'Edge deployed' }
    ],
    timeline: 'Internal Beta',
    tech: ['Mix AI', 'Groq LLaMA 3', 'Gemini 1.5', 'FastAPI', 'Supabase'],
    quote: 'We designed the backend architecture to handle weekend dinner rushes without dropping a single order.',
    quotePerson: 'Pratham, Founder & System Architect'
  },
  {
    id: 'URBAN CUTS',
    company: 'Urban Cuts (Proof of Concept)',
    industry: 'Smart Salon Management',
    logo: 'UC',
    color: 'from-pink-400 to-rose-400',
    challenge: 'Salons face double-bookings and heavy manual admin work due to outdated scheduling software.',
    solution: 'Developed a frictionless, modern web UI that automates appointment booking, staff tracking, and calendar syncing.',
    results: [
      { label: 'Double Bookings', value: 'Zero', detail: 'algorithmic prevention' },
      { label: 'UI Load Time', value: '<1s', detail: 'highly optimized React' },
      { label: 'Test Schedules', value: '1000+', detail: 'processed smoothly' },
      { label: 'Data Accuracy', value: '100%', detail: 'during stress test' }
    ],
    timeline: 'PoC Phase',
    tech: ['React', 'Tailwind CSS', 'Vite', 'Framer Motion'],
    quote: 'The goal was absolute simplicity. A salon owner shouldn’t need a manual to run their software.',
    quotePerson: 'Pratham, Product Strategist'
  },
  {
    id: 'Travojo',
    company: 'Travojo (Hackathon Prototype)',
    industry: 'Travel & Safety Ecosystem',
    logo: 'TJ',
    color: 'from-blue-400 to-cyan-400',
    challenge: 'Travelers often lack real-time, hyper-local safety awareness and intelligent routing when exploring unfamiliar areas.',
    solution: 'Built a smart ecosystem integrating hyper-local maps with an AI travel agent to provide secure, optimized navigation and real-time alerts.',
    results: [
      { label: 'Route Generation', value: '<2s', detail: 'dynamic map routing' },
      { label: 'Safety Alerts', value: 'Real-time', detail: 'hyper-local data sync' },
      { label: 'Bot Latency', value: '<1s', detail: 'travel AI assistant' },
      { label: 'System Stability', value: '100%', detail: 'during live demo' }
    ],
    timeline: 'Hackathon Project',
    tech: ['AI Agents', 'Maps API', 'React', 'FastAPI', 'Tailwind'],
    quote: 'Safety should never be an afterthought. We designed Travojo to act as a real-time digital guardian for travelers.',
    quotePerson: 'Pratham, Team Lead'
  },
]

function ResultPill({ label, value, detail }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <p className="font-display font-bold text-2xl text-white">{value}</p>
      <p className="text-xs font-mono text-brand-400 mt-0.5">{label}</p>
      <p className="text-[11px] text-gray-600 mt-0.5">{detail}</p>
    </div>
  )
}

function CaseCard({ c, i }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.1 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className={`h-1.5 bg-gradient-to-r ${c.color}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0`}>
              {c.logo}
            </div>
            <div>
              <p className="font-display font-bold text-white">{c.company}</p>
              <span className="text-xs font-mono text-gray-500">{c.industry}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 flex-shrink-0">
            <Clock size={11} /> {c.timeline}
          </div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {c.results.map(r => <ResultPill key={r.label} {...r} />)}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors"
        >
          {expanded ? 'Hide details' : 'Read full case study'}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-5 space-y-5 border-t border-white/5 mt-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 border border-red-500/10">
                    <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2">Challenge</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{c.challenge}</p>
                  </div>
                  <div className="glass rounded-xl p-4 border border-brand-500/10">
                    <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">Solution</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{c.solution}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {c.tech.map(t => (
                    <span key={t} className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-gray-400">{t}</span>
                  ))}
                </div>

                <blockquote className="border-l-2 border-brand-500/40 pl-4">
                  <p className="text-gray-300 text-sm italic">"{c.quote}"</p>
                  <p className="text-xs font-mono text-gray-500 mt-1.5">— {c.quotePerson}</p>
                </blockquote>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function CaseStudies() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Case Studies" description="Real results from real clients — see how PRATHOMIX delivered AI-powered transformations." />
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex"><Star size={10} /> Client Results</span>
          <h1 className="section-heading mb-4">
            Proven <span className="text-gradient">Impact</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Not just testimonials — real metrics, real timelines, real transformations.
          </p>
        </motion.div>

        <div className="space-y-6 mb-14">
          {CASES.map((c, i) => <CaseCard key={c.id} c={c} i={i} />)}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-10 text-center"
        >
          <Building2 size={36} className="text-brand-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-white mb-3">
            Could your company be next?
          </h2>
          <p className="text-gray-400 mb-7 max-w-lg mx-auto">
            Every case study started with one conversation. Tell us your problem — we'll map the solution.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Start a Conversation <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
