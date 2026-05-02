import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion'
import {
  Zap, Layers, TrendingUp, ArrowRight, Users,
  Code2, Brain, Cpu, Shield, Rocket, ChevronDown,
  Terminal, GitBranch, Database,
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

// ─── animation variants ───────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
}

const slideLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

const slideRight = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

// ─── stagger container ────────────────────────────────────────
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}

// ─── data ──────────────────────────────────────────────────────
const PHILOSOPHY = [
  {
    icon:  Zap,
    label: '01',
    title: 'Fast Delivery',
    body:  "We don't waste time in endless meetings. We start building your project quickly so you can launch your software in weeks, not months.",
    accent: '#10b981',   // emerald
    glow:   'rgba(16,185,129,0.18)',
  },
  {
    icon:  Layers,
    label: '02',
    title: 'Keep It Simple',
    body:  "We use powerful AI and smart coding behind the scenes, but we make the final software very easy to use. Your team won't need special training to run it.",
    accent: '#3b82f6',   // blue
    glow:   'rgba(59,130,246,0.18)',
  },
  {
    icon:  TrendingUp,
    label: '03',
    title: 'Built to Grow',
    body:  "As your business gets bigger and gets more users, the software we build will handle it easily. It is designed to grow with you without slowing down or crashing.",
    accent: '#8b5cf6',   // violet
    glow:   'rgba(139,92,246,0.18)',
  },
]

const TEAM_ROLES = [
  { icon: Code2,    role: 'Custom Web Applications',  /*count: '3x'*/ },
  { icon: Brain,    role: 'AI Tool Integration',   /*count: '2x'*/ },
  { icon: Database, role: 'Systems Architects',     /*count: '1x'*/ },
  { icon: Shield,   role: 'Secure Backend Systems',      /*count: '1x'*/ },
  { icon: Terminal, role: 'Product Strategist',     /*count: '1x'*/ },
]

const STATS = [
  { value: 'Fast Delivery',    label: 'No delays or excuses',    color: '#10b981' },
  { value: 'Custom Software',  label: 'Built for your needs',  color: '#3b82f6' },
  { value: 'Smart AI Tools',    label: 'Latest technology', color: '#8b5cf6' },
  { value: '100% Remote', label: 'Always online to help',       color: '#f59e0b' },
]

// ─── sub-components ───────────────────────────────────────────

function SectionTag({ children }) {
  return (
    <motion.span
      variants={fadeIn}
      custom={0}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono
                 tracking-[0.18em] uppercase border select-none"
      style={{
        background:   'rgba(16,185,129,0.08)',
        borderColor:  'rgba(16,185,129,0.25)',
        color:        '#6ee7b7',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {children}
    </motion.span>
  )
}


// ─── philosophy card ─────────────────────────────────────────
function PhilosophyCard({ card, i }) {
  const ref  = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const Icon = card.icon

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="relative rounded-2xl p-[1px] overflow-hidden cursor-default group"
      style={{ background: `linear-gradient(135deg, ${card.accent}33, transparent 60%)` }}
    >
      {/* inner glass */}
      <div
        className="relative rounded-2xl h-full p-7 flex flex-col gap-5"
        style={{
          background:      'rgba(5, 10, 25, 0.82)',
          backdropFilter:  'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* corner glow */}
        <div
          className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* number label */}
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: `${card.accent}99` }}
        >
          {card.label}
        </span>

        {/* icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:  `${card.accent}15`,
            border:      `1px solid ${card.accent}30`,
            boxShadow:   `0 0 20px ${card.accent}20`,
          }}
        >
          <Icon size={22} style={{ color: card.accent }} />
        </div>

        {/* text */}
        <div>
          <h3
            className="font-display font-bold text-xl text-white mb-3 leading-snug"
          >
            {card.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            {card.body}
          </p>
        </div>

        {/* bottom accent line */}
        <div
          className="mt-auto h-0.5 w-10 rounded-full transition-all duration-500 group-hover:w-full"
          style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }}
        />
      </div>
    </motion.div>
  )
}

// ─── stat chip ────────────────────────────────────────────────
function StatChip({ value, label, color, i }) {
  const ref  = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="flex flex-col items-center gap-2 px-4 py-6 rounded-2xl text-center"
      style={{
        background:    'rgba(255,255,255,0.03)',
        border:        '1px solid rgba(255,255,255,0.07)',
        backdropFilter:'blur(12px)',
      }}
    >
      <span
        className="font-display font-bold text-2xl md:text-3xl leading-tight"
        style={{
          background: `linear-gradient(135deg, ${color}, white)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
        }}
      >
        {value}
      </span>
      <span
        className="text-[10px] md:text-xs font-mono tracking-widest uppercase leading-snug"
        style={{ color: '#64748b' }}
      >
        {label}
      </span>
    </motion.div>
  )
}

// ─── team role pill ───────────────────────────────────────────
function RolePill({ icon: Icon, role, count, i }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
      style={{
        background:   'rgba(255,255,255,0.04)',
        border:       '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
      >
        <Icon size={15} className="text-emerald-400" />
      </div>
      <span className="text-sm font-body text-gray-300 flex-1">{role}</span>
      <span className="text-xs font-mono text-emerald-500">{count}</span>
    </motion.div>
  )
}

// ─── main page ────────────────────────────────────────────────
export default function AboutUs() {
  // parallax on hero text
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY    = useSpring(useTransform(heroScroll, [0, 1], [0, 120]),  { stiffness: 60, damping: 20 })
  const heroOpac = useSpring(useTransform(heroScroll, [0, 0.7], [1, 0]), { stiffness: 60, damping: 20 })

  // team section inview
  const teamRef   = useRef(null)
  const teamInView = useInView(teamRef, { once: true, margin: '-100px' })

  // cta inview
  const ctaRef   = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-60px' })

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden"
      >
        {/* content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpac }}
          className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto"
        >
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-8"
          >
            <SectionTag>PRATHOMIX — About Us</SectionTag>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="section-heading max-w-5xl mx-auto mb-8 text-white"
          >
            We Don&apos;t Just{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Write Code.
            </span>
            <br />
            We Deliver {' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Results.
              {/* underline accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1 left-0 right-0 h-0.5 rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg md:text-xl leading-relaxed max-w-3xl"
            style={{ color: '#94a3b8' }}
          >
            We bridge the gap between complex{' '}
            <span style={{ color: '#2ee1e1', fontWeight: 600 }}> AI technology and real business growth.</span>
            {' '}Our mission is to eliminate manual bottlenecks by deploying custom-built, scalable
            generative intelligence systems that work for you 24/7.
          </motion.p>

          {/* scroll indicator */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown size={20} style={{ color: '#475569' }} />
            </motion.div>
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: '#334155' }}>
              scroll
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 -mt-8 mb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {STATS.map((s, i) => (
            <StatChip key={s.label} {...s} i={i} />
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          PHILOSOPHY
      ══════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <SectionTag>OUR PROMISE</SectionTag>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 section-heading text-3xl md:text-4xl"
          >
            Our{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
               Simple Rules
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 text-base md:text-lg max-w-xl mx-auto"
            style={{ color: '#64748b' }}
          >
            Three simple principles behind everything we build.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PHILOSOPHY.map((card, i) => (
            <PhilosophyCard key={card.title} card={card} i={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          our approach
      ══════════════════════════════════════════ */}
      <section
        ref={teamRef}
        className="relative z-10 max-w-6xl mx-auto px-4 mb-32"
      >
        {/* container glass card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={teamInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden p-[1px]"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(59,130,246,0.15), rgba(139,92,246,0.2))',
          }}
        >
          <div
            className="relative rounded-3xl p-8 md:p-12"
            style={{
              background:        'rgba(3, 7, 18, 0.88)',
              backdropFilter:    'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* scanning grid overlay */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none opacity-5"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-start">

              {/* left — text */}
              <div>
                <motion.div
                  variants={slideLeft}
                  initial="hidden"
                  animate={teamInView ? 'visible' : 'hidden'}
                >
                  <SectionTag>The Core Engine</SectionTag>

                  {/*  badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={teamInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 mb-5 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl"
                    style={{
                      background:    'rgba(16,185,129,0.08)',
                      border:        '1px solid rgba(16,185,129,0.25)',
                    }}
                  >
                    <div className="relative">
                      <Users size={22} className="text-emerald-400" />
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    </div>
                    <span
                      className="font-display font-black text-2xl tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor:  'transparent',
                      }}
                    >
                      OUR APPROACH
                    </span>
                  </motion.div>

                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    initial="hidden"
                    animate={teamInView ? 'visible' : 'hidden'}
                    className="font-display font-bold text-3xl md:text-4xl text-white mb-6 leading-snug"
                  >
                    Lean Architecture.
                    <br />
                    <span style={{ color: '#94a3b8' }}> Maximum Output.</span>
                  </motion.h2>

                  <motion.p
                    variants={fadeUp}
                    custom={2}
                    initial="hidden"
                    animate={teamInView ? 'visible' : 'hidden'}
                    className="text-base leading-relaxed mb-6"
                    style={{ color: '#94a3b8' }}
                  >
                    At the heart of PRATHOMIX is a{' '}
                    <span style={{ color: '#6ee7b7', fontWeight: 600 }}>highly specialized development process.</span>
                    {' '}We don't believe in slow corporate hierarchies. By combining modern tech stacks with AI-powered
                    development, we deliver enterprise-grade solutions at lightning speed. No bloat. Just execution.
                  </motion.p>

                  <motion.p
                    variants={fadeUp}
                    custom={3}
                    initial="hidden"
                    animate={teamInView ? 'visible' : 'hidden'}
                    className="text-base leading-relaxed"
                    style={{ color: '#64748b' }}
                  >
                    "Instead of managing{' '}
                    <span style={{ color: '#93c5fd' }}>large groups of people</span>
                    , we use powerful AI and modern coding tools to do the heavy lifting.
                    This means your project gets done faster, costs less, and works perfectly from day one.
                  </motion.p>

                  {/* capability pills */}
                  <motion.div
                    variants={fadeUp}
                    custom={4}
                    initial="hidden"
                    animate={teamInView ? 'visible' : 'hidden'}
                    className="mt-8 flex flex-wrap gap-2"
                  >
                    {['Groq + Gemini', 'FastAPI', 'React 18', 'Supabase', 'Docker', 'LLM Fine-tuning'].map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-mono"
                        style={{
                          background:  'rgba(255,255,255,0.05)',
                          border:      '1px solid rgba(255,255,255,0.1)',
                          color:       '#94a3b8',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* right — role pills */}
              <motion.div
                variants={slideRight}
                initial="hidden"
                animate={teamInView ? 'visible' : 'hidden'}
                className="flex flex-col gap-3"
              >
                {/* tech arsenal badges */}
                <motion.div
                  initial="hidden"
                  animate={teamInView ? 'visible' : 'hidden'}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                  }}
                  className="flex flex-wrap items-center gap-2 mb-4"
                >
                  {['Docker', 'FastAPI', 'Gemini', 'GitHub', 'Groq', 'Hugging Face', 'PostgreSQL', 'Python', 'React', 'Redis', 'Supabase'].map(tool => (
                    <motion.span
                      key={tool}
                      variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                      className="px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#cbd5f5',
                      }}
                    >
                      {tool}
                    </motion.span>
                  ))}
                </motion.div>

                <p
                  className="text-xs font-mono mb-2 tracking-widest uppercase"
                  style={{ color: '#334155' }}
                >
                  CORE CAPABILITIES
                </p>

                {TEAM_ROLES.map((r, i) => (
                  <RolePill key={r.role} {...r} i={i} />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative z-10 max-w-6xl mx-auto px-4 mb-28"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden p-[1px]"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(59,130,246,0.3) 50%, rgba(139,92,246,0.4) 100%)',
          }}
        >
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-16 md:px-16 md:py-20"
            style={{ background: 'rgba(3, 7, 18, 0.90)', backdropFilter: 'blur(24px)' }}
          >
            {/* animated gradient bg */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-20"
              style={{
                background:        'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
                backgroundSize:    '300% 300%',
              }}
            />

            {/* decorative Cpu icon */}
            <div className="absolute right-8 bottom-8 opacity-5">
              <Cpu size={180} color="white" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={ctaInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <GitBranch size={14} className="text-emerald-400" />
                    <span
                      className="text-xs font-mono tracking-widest uppercase"
                      style={{ color: '#6ee7b7' }}
                    >
                      READY TO START?
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight text-white">
                    Stop worrying about{' '}
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                       technology.
                    </span>
                    <br />
                    et us build your {' '}
                    <span style={{ color: '#c4b5fd' }}>custom software.</span>
                  </h2>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={ctaInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 flex-shrink-0"
              >
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-display font-semibold text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background:  'linear-gradient(135deg, #10b981, #3b82f6)',
                    boxShadow:   '0 0 30px rgba(16,185,129,0.3)',
                  }}
                >
                  <Rocket size={16} />
                  See Our Work
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/founder"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-display font-semibold text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background:    'rgba(255,255,255,0.06)',
                    border:        '1px solid rgba(255,255,255,0.15)',
                    backdropFilter:'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                    e.currentTarget.style.background  = 'rgba(139,92,246,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <Brain size={16} className="text-violet-400" />
                  Discuss Your Project
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: '#a78bfa' }}
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}