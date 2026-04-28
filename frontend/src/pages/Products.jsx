import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, BarChart2, Workflow, Shield, Zap, ExternalLink } from 'lucide-react'

const PRODUCTS = [
  {
    icon: Cpu,
    name: 'NexusBot',
    tagline: 'AI chatbot for support',
    description: 'A fast chatbot for web, WhatsApp, and Slack.',
    status: 'Live',
    badge: 'bg-green-500/15 text-green-400 border-green-500/20',
    color: 'from-brand-400 to-teal-300',
    link: '#',
    features: ['Smart routing', 'Memory', 'Lead capture', 'Analytics'],
  },
  {
    icon: Workflow,
    name: 'FlowMind',
    tagline: 'Workflow automation studio',
    description: 'Build workflows with simple blocks. Connect APIs and automate steps.',
    status: 'Beta',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    color: 'from-ink-400 to-violet-300',
    link: '#',
    features: ['Drag-and-drop builder', '200+ integrations', 'AI decision nodes', 'Audit logs'],
  },
  {
    icon: BarChart2,
    name: 'InsightAI',
    tagline: 'Ask data in simple words',
    description: 'Ask in plain English and get clear charts. Connects to your data sources.',
    status: 'Coming Soon',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    color: 'from-sky-400 to-cyan-300',
    link: '#',
    features: ['Plain-language queries', 'Auto charts', 'Scheduled reports', 'Team sharing'],
  },
  {
    icon: Shield,
    name: 'VaultAuth',
    tagline: 'Simple, secure login',
    description: 'Add login with MFA, roles, and audit trails.',
    status: 'Coming Soon',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    color: 'from-rose-400 to-pink-300',
    link: '#',
    features: ['MFA / OTP', 'RBAC', 'Session management', 'Compliance ready'],
  },
  {
    icon: Zap,
    name: 'SprintKit',
    tagline: 'AI task helper',
    description: 'Break big work into tasks and track progress early.',
    status: 'Coming Soon',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    color: 'from-amber-400 to-yellow-300',
    link: '#',
    features: ['AI task breakdown', 'Sprint planning', 'Burndown charts', 'GitHub sync'],
  },
]

export default function Products() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-flex">AI Tools</span>
          <h1 className="section-heading mb-4">
            Products Built for{' '}
            <span className="text-gradient">Real Work</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each product solves a real problem with simple, useful AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PRODUCTS.map(({ icon: Icon, name, tagline, description, status, badge, color, link, features }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-hover rounded-2xl p-6 flex flex-col group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} p-0.5`}>
                  <div className="w-full h-full rounded-[14px] bg-gray-950/80 flex items-center justify-center">
                    <Icon size={22} className="text-white" />
                  </div>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${badge}`}>
                  {status}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-white mb-1">{name}</h2>
              <p className={`text-xs font-mono bg-gradient-to-r ${color} bg-clip-text text-transparent mb-3`}>
                {tagline}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5">{description}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={link}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm font-body text-gray-300 hover:text-white hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-200"
              >
                Explore Product <ExternalLink size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
