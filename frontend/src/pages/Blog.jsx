import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const POSTS = [
  {
    slug: 'groq-vs-openai-speed',
    title: 'Groq vs OpenAI: Why Speed Matters for Production Chatbots',
    excerpt: "When we built Mix AI, we benchmarked every major LLM provider. The results were shocking — here's why Groq's LPU architecture changes everything for real-time AI applications.",
    date: '2025-06-01',
    readTime: '6 min',
    tags: ['AI', 'Groq', 'Performance'],
    category: 'Engineering',
    color: 'from-brand-400 to-teal-400',
  },
  {
    slug: 'supabase-row-level-security',
    title: 'Supabase RLS: The Right Way to Secure Multi-Tenant SaaS',
    excerpt: "Row Level Security is Supabase's superpower — but most tutorials only scratch the surface. We'll walk through the exact policies we use in PRATHOMIX to protect user data at the database layer.",
    date: '2025-05-18',
    readTime: '9 min',
    tags: ['Supabase', 'Security', 'Postgres'],
    category: 'Security',
    color: 'from-rose-400 to-pink-400',
  },
  {
    slug: 'fastapi-production-setup',
    title: 'FastAPI in Production: Docker, CORS, JWT, and Rate Limiting',
    excerpt: "Going from FastAPI tutorial to production-ready API is a big jump. Here's our complete setup — multi-stage Docker builds, Supabase JWT validation middleware, and a sliding-window rate limiter.",
    date: '2025-05-05',
    readTime: '12 min',
    tags: ['FastAPI', 'Docker', 'Python'],
    category: 'Engineering',
    color: 'from-ink-400 to-violet-400',
  },
  {
    slug: 'framer-motion-glassmorphism',
    title: 'Building Glassmorphism UIs with Framer Motion and Tailwind CSS',
    excerpt: "The PRATHOMIX frontend uses a custom glass design system that took weeks to perfect. We're open-sourcing the patterns — canvas backgrounds, blur effects, animated borders, and more.",
    date: '2025-04-20',
    readTime: '8 min',
    tags: ['React', 'Tailwind', 'UI/UX'],
    category: 'Design',
    color: 'from-amber-400 to-orange-400',
  },
  {
    slug: 'ai-chatbot-intent-routing',
    title: 'Multi-Model AI Routing: Using Groq for Intent and Gemini for Depth',
    excerpt: "Our SmartBot uses two LLMs in tandem — Groq's LLaMA 3 for sub-200ms intent classification, then Gemini 1.5 Flash for nuanced, contextual answers. Here's the full architecture.",
    date: '2025-04-08',
    readTime: '10 min',
    tags: ['AI', 'Architecture', 'Gemini'],
    category: 'AI',
    color: 'from-emerald-400 to-cyan-400',
  },
]

const CATEGORIES = ['All', ...new Set(POSTS.map(p => p.category))]

export default function Blog() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? POSTS : POSTS.filter(p => p.category === active)

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Blog" description="Engineering insights, AI deep-dives, and SaaS building blocks from PRATHOMIX." />
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex"><BookOpen size={10} /> PRATHOMIX Blog</span>
          <h1 className="section-heading mb-4">
            Engineering <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Deep-dives on AI, FastAPI, React, and building production SaaS — from the team that ships.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 ${
                active === cat
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                  : 'text-gray-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="space-y-5">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="glass-hover rounded-2xl p-6 group flex flex-col sm:flex-row gap-5"
            >
              {/* Color accent */}
              <div className={`w-1.5 rounded-full bg-gradient-to-b ${post.color} flex-shrink-0 hidden sm:block`} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-mono bg-gradient-to-r ${post.color} bg-clip-text text-transparent`}>
                    {post.category}
                  </span>
                  <span className="text-gray-700 text-xs">·</span>
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                    <Clock size={10} /> {post.readTime} read
                  </span>
                  <span className="text-gray-700 text-xs">·</span>
                  <span className="text-xs font-mono text-gray-600">
                    {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h2 className="font-display font-bold text-white text-lg mb-2 group-hover:text-brand-200 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] font-mono text-gray-600 border border-white/8 rounded-full px-2 py-0.5">
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200 font-mono transition-colors">
                    Read article <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 glass rounded-2xl p-8 text-center"
        >
          <BookOpen size={32} className="text-brand-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Never miss a post</h2>
          <p className="text-gray-400 text-sm mb-5">Engineering insights, product launches, and AI news — straight to your inbox.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input type="email" placeholder="you@example.com" className="input-field flex-1" />
            <button className="btn-primary text-sm px-5 flex-shrink-0">Subscribe</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
