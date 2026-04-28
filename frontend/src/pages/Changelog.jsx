import React from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Zap, Bug, Star, ArrowUp } from 'lucide-react'
import SEO from '../components/SEO'

const RELEASES = [
  {
    version: 'v1.3.0',
    date: '2025-06-10',
    type: 'minor',
    highlights: [
      { kind: 'feat',   text: 'Added Stripe payment integration stubs with checkout + billing portal' },
      { kind: 'feat',   text: 'Webhook receiver for Stripe, Supabase, and generic HMAC sources' },
      { kind: 'feat',   text: 'Advanced admin API: platform stats, top intents, top pages, bulk resolve' },
      { kind: 'feat',   text: 'Privacy Policy and Terms of Use pages' },
      { kind: 'feat',   text: 'Interactive API Docs page with cURL examples' },
      { kind: 'feat',   text: 'Background task queue: welcome emails, lead alerts, event logging' },
      { kind: 'feat',   text: 'Redis cache client with graceful no-op fallback' },
      { kind: 'feat',   text: 'SQL migration runner for version-controlled schema changes' },
      { kind: 'feat',   text: 'Prometheus-compatible MetricsMiddleware and /metrics endpoint' },
      { kind: 'fix',    text: 'Skeleton shimmer animation keyframe added to index.css' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2025-05-28',
    type: 'minor',
    highlights: [
      { kind: 'feat',   text: 'SmartBot real-time Supabase presence integration' },
      { kind: 'feat',   text: 'UserSettings page: profile edit, password change, notification toggles' },
      { kind: 'feat',   text: 'Blog page with category filter and subscribe CTA' },
      { kind: 'feat',   text: 'OnboardingFlow 3-step welcome modal for new users' },
      { kind: 'feat',   text: 'ThemeProvider: Teal / Violet / Rose / Amber accent switching' },
      { kind: 'feat',   text: 'PWA manifest.json — installable as desktop app' },
      { kind: 'feat',   text: 'Privacy-first analytics with useAnalytics hook' },
      { kind: 'feat',   text: 'useRealtime hook for live Supabase table sync' },
      { kind: 'feat',   text: 'Makefile with 15 developer convenience commands' },
      { kind: 'feat',   text: 'Pre-deploy env validator (scripts/validate_env.py)' },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2025-05-10',
    type: 'minor',
    highlights: [
      { kind: 'feat',   text: 'JWT auth middleware with require_auth and require_admin guards' },
      { kind: 'feat',   text: 'Sliding-window IP rate limiter middleware' },
      { kind: 'feat',   text: 'Projects CRUD API (public read, admin write)' },
      { kind: 'feat',   text: 'Contact form API endpoint with Supabase persistence' },
      { kind: 'feat',   text: 'Leads management API with resolve and delete' },
      { kind: 'feat',   text: 'CommandPalette (Cmd+K) for keyboard-first navigation' },
      { kind: 'feat',   text: 'Contact page with form + contact methods' },
      { kind: 'feat',   text: 'Pricing page with monthly/yearly toggle' },
      { kind: 'feat',   text: 'Case Studies page with expandable details' },
      { kind: 'fix',    text: 'Nginx nginx.conf SPA routing for React Router' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-05-01',
    type: 'major',
    highlights: [
      { kind: 'feat',   text: 'Initial PRATHOMIX platform launch' },
      { kind: 'feat',   text: 'SmartBot: Groq LLaMA-3 intent parsing + Gemini 1.5 deep reasoning' },
      { kind: 'feat',   text: 'Glassmorphism dark-mode UI with animated canvas background' },
      { kind: 'feat',   text: 'Supabase Auth: register, sign in, JWT session management' },
      { kind: 'feat',   text: 'Admin dashboard: project upload, lead view, GitHub links' },
      { kind: 'feat',   text: 'Docker + Nginx multi-stage production build' },
      { kind: 'feat',   text: 'GitHub Actions CI (lint + build) and CD (deploy) workflows' },
      { kind: 'feat',   text: 'Full Supabase schema with RLS policies and auto-profile trigger' },
    ],
  },
]

const KIND_CONFIG = {
  feat: { icon: Zap,     color: 'text-brand-400',  bg: 'bg-brand-500/10  border-brand-500/20',  label: 'Feature' },
  fix:  { icon: Bug,     color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/20',  label: 'Fix'     },
  perf: { icon: ArrowUp, color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/20',  label: 'Perf'    },
  break:{ icon: Star,    color: 'text-rose-400',   bg: 'bg-rose-500/10   border-rose-500/20',   label: 'Breaking'},
}

const VERSION_COLOR = { major: 'from-rose-400 to-pink-400', minor: 'from-brand-400 to-teal-400', patch: 'from-gray-400 to-gray-600' }

export default function Changelog() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Changelog" description="PRATHOMIX release history — features, fixes, and improvements." />
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex"><GitBranch size={10} /> Release Notes</span>
          <h1 className="section-heading mb-4">
            What's <span className="text-gradient">New</span>
          </h1>
          <p className="text-gray-400">Every improvement, fix, and feature — tracked in the open.</p>
        </motion.div>

        <div className="relative pl-6 border-l border-white/8 space-y-12">
          {RELEASES.map((release, ri) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ri * 0.08 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[29px] w-4 h-4 rounded-full bg-gradient-to-br ${VERSION_COLOR[release.type]} border-2 border-gray-950`} />

              {/* Header */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`font-display font-bold text-xl bg-gradient-to-r ${VERSION_COLOR[release.type]} bg-clip-text text-transparent`}>
                  {release.version}
                </span>
                <span className="text-xs font-mono text-gray-500">{release.date}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border capitalize
                  ${release.type === 'major' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : release.type === 'minor' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {release.type}
                </span>
              </div>

              {/* Items */}
              <div className="glass rounded-2xl p-5 space-y-2.5">
                {release.highlights.map((item, ii) => {
                  const cfg  = KIND_CONFIG[item.kind] || KIND_CONFIG.feat
                  const Icon = cfg.icon
                  return (
                    <div key={ii} className="flex items-start gap-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                        <Icon size={9} />{cfg.label}
                      </span>
                      <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
