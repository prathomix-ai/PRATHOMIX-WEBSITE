import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Brain, Zap, Shield, Globe,
  TrendingUp, MessageSquare, Code2, Layers
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 30 },
  animate:   { opacity: 1, y: 0  },
  transition:{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const PROBLEMS = [
  {
    icon: Brain,
    problem: 'Too much manual work',
    solution: 'We automate repeat tasks so your team can focus on real work.',
    color: 'from-brand-400 to-teal-400',
  },
  {
    icon: TrendingUp,
    problem: 'Growth is hard without systems',
    solution: 'We build SaaS systems that scale with your business.',
    color: 'from-ink-400 to-violet-400',
  },
  {
    icon: MessageSquare,
    problem: 'Customer questions get missed',
    solution: 'We build smart chatbots that answer fast and hand off to people.',
    color: 'from-amber-400 to-orange-400',
  },
  {
    icon: Code2,
    problem: 'Old tech slows you down',
    solution: 'We modernize your stack with React, FastAPI, and cloud tools.',
    color: 'from-rose-400 to-pink-400',
  },
]

const STATS = [
  { value: '10x', label: 'Faster Delivery' },
  { value: '99%', label: 'Happy Clients'   },
  { value: '50+', label: 'Projects Done'   },
  { value: '24h', label: 'Reply Time'      },
]

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20 pb-16">
        <motion.div {...fadeUp(0.1)} className="mb-5">
          <span className="tag">AI Platform</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.2)} className="section-heading max-w-4xl mx-auto mb-6">
          <span className="text-white">Intelligence</span>{' '}
          <span className="text-gradient">Meets Execution</span>
        </motion.h1>

        <motion.p {...fadeUp(0.35)} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          PRATHOMIX is a generative intelligence engine. We build simple AI products,
          automation, and chatbots that help businesses work faster.
        </motion.p>

        <motion.div {...fadeUp(0.5)} className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/services" className="btn-primary flex items-center gap-2">
            Explore Services <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn-ghost flex items-center gap-2">
            <Layers size={16} /> View Products
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-0.5 h-8 bg-gradient-to-b from-brand-400 to-transparent rounded-full"
          />
          <span className="text-xs font-mono text-gray-600">scroll</span>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/5"
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center px-4">
              <p className="font-display font-bold text-3xl text-gradient">{value}</p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Problem → Solution */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex">
            <Globe size={10} /> Why PRATHOMIX?
          </span>
          <h2 className="section-heading text-3xl md:text-4xl">
            Real Problems.{' '}
            <span className="text-gradient">Real Solutions.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROBLEMS.map(({ icon: Icon, problem, solution, color }, i) => (
            <motion.div
              key={problem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="glass-hover rounded-2xl p-6 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Problem</p>
              <p className="text-gray-300 text-sm mb-4 line-through decoration-red-500/50">{problem}</p>
              <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">Solution</p>
              <p className="text-white font-body leading-relaxed">{solution}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-ink-700/40 to-brand-600/40 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
          <div className="relative z-10 glass rounded-3xl p-10 md:p-14 text-center">
            <Shield size={36} className="text-brand-300 mx-auto mb-5" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to build something real?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Tell us your goal. We will plan, build, and launch with you.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
              Start for Free <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
