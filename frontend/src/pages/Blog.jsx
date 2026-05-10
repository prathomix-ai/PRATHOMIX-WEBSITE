import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, ArrowRight, Tag, X,
  Search, ChevronLeft, Copy, Check,
  Eye, Calendar, Zap,
} from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

const POSTS = [
  {
    slug: 'groq-vs-openai-speed',
    title: 'Groq vs OpenAI: Why Speed Matters for Production Chatbots',
    excerpt: "When we built NexusBot, we benchmarked every major LLM provider. The results were shocking — here's why Groq's LPU architecture changes everything for real-time AI.",
    date: '2025-06-01', readTime: '6 min', views: '1.2k',
    tags: ['AI', 'Groq', 'Performance'], category: 'Engineering',
    author: 'Pratham', accent: '#0a9090', color: 'from-brand-400 to-teal-400',
    content: [
      { type: 'h2', text: 'The Problem with Slow AI Responses' },
      { type: 'p',  text: 'When users interact with a chatbot, every millisecond counts. Response times above 2 seconds cause a significant drop in user engagement. Traditional LLM APIs like OpenAI GPT-4 were averaging 8-15 seconds for complex queries — completely unacceptable for a production chatbot.' },
      { type: 'h2', text: 'What We Tested' },
      { type: 'p',  text: 'We benchmarked: OpenAI GPT-4 (avg 8-14s), OpenAI GPT-3.5 (avg 2-4s), Google Gemini 1.5 Flash (avg 1.5-3s), and Groq LLaMA 3 (avg 150-400ms).' },
      { type: 'h2', text: 'Why Groq Is Different' },
      { type: 'p',  text: 'Groq built custom silicon called the Language Processing Unit (LPU). Unlike GPUs designed for training, LPUs are purpose-built for inference. Result: 10-100x faster token generation, consistent latency with no cold starts, and a generous free tier.' },
      { type: 'code', text: '# Our hybrid routing\nasync def route_intent(message):\n    # Fast: Groq for classification\n    intent = await groq_classify(message)\n    if intent == "complex":\n        # Quality: Gemini for reasoning\n        return await gemini_answer(message)\n    return await groq_answer(message)' },
      { type: 'h2', text: 'Results After Switching' },
      { type: 'p',  text: 'After migrating NexusBot to this hybrid architecture: User satisfaction increased 34%, session length increased 41%, and support ticket deflection hit 78%.' },
    ],
  },
  {
    slug: 'supabase-rls-guide',
    title: 'Supabase RLS: The Right Way to Secure Multi-Tenant SaaS',
    excerpt: "Row Level Security is Supabase's superpower — but most tutorials only scratch the surface. We walk through the exact policies we use in PRATHOMIX to protect user data.",
    date: '2025-05-18', readTime: '9 min', views: '987',
    tags: ['Supabase', 'Security', 'Postgres'], category: 'Security',
    author: 'Pratham', accent: '#e11d48', color: 'from-rose-400 to-pink-400',
    content: [
      { type: 'h2', text: 'What is Row Level Security?' },
      { type: 'p',  text: 'RLS is a PostgreSQL feature that defines who can see and modify which rows at the database level — not in your application code. This is powerful: even if your API has a bug, the database will not return the wrong user data.' },
      { type: 'h2', text: 'The Problem with Disabling RLS' },
      { type: 'p',  text: 'Many beginner tutorials tell you to disable RLS to make things easier. This is a critical security mistake. Without RLS, any user who gets a valid JWT can potentially access all rows in your tables.' },
      { type: 'h2', text: 'PRATHOMIX Exact Policies' },
      { type: 'code', text: '-- Users read only their own logs\nCREATE POLICY "users_read_own"\n  ON public.chatbot_logs FOR SELECT\n  USING (auth.uid() = user_id);\n\n-- Backend service role can do everything\nCREATE POLICY "service_role_all"\n  ON public.chatbot_logs FOR ALL\n  USING (auth.role() = \'service_role\');\n\n-- Anyone can insert (for unauthenticated chatbot users)\nCREATE POLICY "anon_insert"\n  ON public.chatbot_logs FOR INSERT\n  WITH CHECK (true);' },
      { type: 'h2', text: 'The Two Keys You Must Understand' },
      { type: 'p',  text: 'Anon key: safe for frontend, limited by RLS. Service role key: bypasses RLS entirely — only use in backend. The #1 mistake is putting the service role key in frontend JavaScript. If a user finds it in your bundle, they have unrestricted database access.' },
    ],
  },
  {
    slug: 'fastapi-production',
    title: 'FastAPI in Production: Docker, CORS, JWT, and Rate Limiting',
    excerpt: 'Going from FastAPI tutorial to production-ready API is a big jump. Here is our complete setup — multi-stage Docker builds, Supabase JWT validation, and a sliding-window rate limiter.',
    date: '2025-05-05', readTime: '12 min', views: '2.1k',
    tags: ['FastAPI', 'Docker', 'Python'], category: 'Engineering',
    author: 'Pratham', accent: '#7c3aed', color: 'from-ink-400 to-violet-400',
    content: [
      { type: 'h2', text: 'Production CORS Configuration' },
      { type: 'code', text: 'app.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://yourapp.com"],\n    allow_credentials=True,\n    allow_methods=["GET","POST","PUT","DELETE","OPTIONS"],\n    allow_headers=["Content-Type","Authorization"],\n    max_age=600,\n)' },
      { type: 'h2', text: 'JWT Validation with Supabase' },
      { type: 'code', text: 'async def require_auth(creds=Depends(HTTPBearer())):\n    try:\n        payload = jwt.decode(\n            creds.credentials,\n            os.getenv("SUPABASE_JWT_SECRET"),\n            algorithms=["HS256"],\n            options={"verify_aud": False},\n        )\n        return payload\n    except jwt.ExpiredSignatureError:\n        raise HTTPException(401, "Token expired")' },
      { type: 'h2', text: 'Sliding Window Rate Limiter' },
      { type: 'code', text: 'class RateLimiter:\n    def __init__(self, max_calls=30, period=60):\n        self.max_calls = max_calls\n        self.period = period\n        self._store = defaultdict(deque)\n\n    async def __call__(self, request: Request):\n        key = request.client.host\n        now = time.monotonic()\n        q = self._store[key]\n        while q and q[0] < now - self.period:\n            q.popleft()\n        if len(q) >= self.max_calls:\n            raise HTTPException(429, "Rate limit exceeded")\n        q.append(now)' },
      { type: 'h2', text: 'Multi-Stage Docker Build' },
      { type: 'code', text: 'FROM python:3.11-slim AS builder\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nFROM python:3.11-slim AS runner\nWORKDIR /app\nRUN addgroup --system app && adduser --system --ingroup app app\nCOPY --from=builder /usr/local/lib/python3.11/site-packages .\nCOPY . .\nUSER app\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]' },
    ],
  },
  {
    slug: 'react-glassmorphism',
    title: 'Building Glassmorphism UIs with Framer Motion and Tailwind CSS',
    excerpt: 'The PRATHOMIX frontend uses a custom glass design system that took weeks to perfect. We are open-sourcing the patterns — canvas backgrounds, blur effects, animated borders, and more.',
    date: '2025-04-20', readTime: '8 min', views: '3.4k',
    tags: ['React', 'Tailwind', 'UI/UX'], category: 'Design',
    author: 'Pratham', accent: '#f59e0b', color: 'from-amber-400 to-orange-400',
    content: [
      { type: 'h2', text: 'The Core CSS Pattern' },
      { type: 'code', text: '.glass {\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.10);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);\n}' },
      { type: 'h2', text: 'Framer Motion Entrance Animations' },
      { type: 'code', text: '<motion.div\n  initial={{ opacity: 0, y: 30 }}\n  whileInView={{ opacity: 1, y: 0 }}\n  viewport={{ once: true }}\n  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n  whileHover={{ y: -4, transition: { duration: 0.2 } }}\n  className="glass rounded-2xl p-6"\n>' },
      { type: 'h2', text: 'Glass Hover Effect' },
      { type: 'code', text: '.glass-hover:hover {\n  background: rgba(255, 255, 255, 0.08);\n  border-color: rgba(13, 148, 148, 0.4);\n  box-shadow: 0 0 40px rgba(13, 148, 148, 0.35);\n  transform: translateY(-2px);\n}' },
      { type: 'h2', text: 'Performance Note' },
      { type: 'p',  text: 'backdrop-filter can be expensive on mobile. Always test performance and consider disabling for low-powered devices using @media (prefers-reduced-motion: reduce). Use will-change: transform sparingly.' },
    ],
  },
  {
    slug: 'ai-multi-model-routing',
    title: 'Multi-Model AI Routing: Gemini to HuggingFace Auto-Switching',
    excerpt: 'Our Mix AI agent uses a smart API router that automatically switches between Gemini and HuggingFace when either hits quota limits — here is the full architecture.',
    date: '2025-04-08', readTime: '10 min', views: '1.8k',
    tags: ['AI', 'Architecture', 'Python'], category: 'AI',
    author: 'Pratham', accent: '#10b981', color: 'from-emerald-400 to-cyan-400',
    content: [
      { type: 'h2', text: 'The Problem: Single Provider Dependency' },
      { type: 'p',  text: 'Every AI product has the same nightmare: your LLM provider goes down or hits quota — and your entire product stops working. We experienced this when Gemini returned 429 errors during peak usage of our Mix chatbot.' },
      { type: 'h2', text: 'The SmartAPIRouter Class' },
      { type: 'code', text: 'class SmartAPIRouter:\n    COOLDOWN = 120  # seconds\n\n    def fail(self, provider):\n        self._state[provider].update(\n            status="cooling",\n            fail_at=time.monotonic()\n        )\n\n    def pick(self):\n        for p in ["gemini", "huggingface"]:\n            if self._state[p]["status"] == "ok":\n                return p\n            elapsed = time.monotonic() - self._state[p]["fail_at"]\n            if elapsed >= self.COOLDOWN:\n                self._state[p]["status"] = "ok"\n                return p\n        return None  # both cooling' },
      { type: 'h2', text: 'The Streaming Loop' },
      { type: 'code', text: 'async def smart_stream(message, session_id):\n    tried = set()\n    while True:\n        provider = router.pick()\n        if provider is None or provider in tried:\n            yield FALLBACK_MESSAGE\n            return\n        tried.add(provider)\n        try:\n            async for chunk in stream(provider, message, session_id):\n                yield chunk\n            router.ok(provider)\n            return\n        except Exception as e:\n            if is_quota_err(e):\n                router.fail(provider)\n                continue\n            raise' },
      { type: 'h2', text: 'Results' },
      { type: 'p',  text: 'Since implementing the Smart Router: zero downtime from provider quota exhaustion, automatic recovery after cooldown, and transparent to users — they see a small provider badge change but nothing breaks.' },
    ],
  },
]

const CATEGORIES = ['All', ...new Set(POSTS.map(p => p.category))]

function renderContent(blocks) {
  return blocks.map((block, i) => {
    if (block.type === 'h2') {
      return (
        <h2 key={i} className="font-display font-bold text-xl text-white mt-8 mb-3 leading-snug">
          {block.text}
        </h2>
      )
    }
    if (block.type === 'code') {
      return (
        <div key={i} className="my-4 rounded-xl overflow-hidden border border-white/8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/8">
            <div className="flex gap-1.5">
              {['bg-red-500/60','bg-amber-500/60','bg-green-500/60'].map(c => (
                <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
              ))}
            </div>
            <span className="text-xs font-mono text-gray-500 ml-1">code</span>
          </div>
          <pre className="bg-gray-950/90 p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
            <code>{block.text}</code>
          </pre>
        </div>
      )
    }
    return (
      <p key={i} className="text-gray-300 leading-relaxed my-3 font-body text-[15px]">
        {block.text}
      </p>
    )
  })
}

function ArticleModal({ post, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  const copy = () => {
    navigator.clipboard.writeText(window.location.href + '/' + post.slug)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col
                   glass border border-white/12 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 flex-shrink-0">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-body">
            <ChevronLeft size={15} /> Blog
          </button>
          <div className="flex items-center gap-2">
            <button onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                         text-gray-400 hover:text-white border border-white/10 hover:border-white/20
                         hover:bg-white/5 transition-all duration-200">
              {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6" style={{ scrollbarWidth: 'thin' }}>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider"
                  style={{ color: post.accent }}>{post.category}</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs font-mono text-gray-500">
              <Clock size={9} /> {post.readTime} read
            </span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs font-mono text-gray-500">
              <Calendar size={9} />
              {new Date(post.date).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'2-digit' })}
            </span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs font-mono text-gray-500">
              <Eye size={9} /> {post.views} views
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-2xl md:text-3xl text-white leading-snug mb-5">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-ink-500
                            flex items-center justify-center text-sm font-display font-bold text-white">
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-white">{post.author}</p>
              <p className="text-xs font-mono text-gray-500">Founder, PRATHOMIX</p>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-gray-400 text-base leading-relaxed mb-6 font-body italic border-l-2 pl-4"
             style={{ borderColor: post.accent }}>
            {post.excerpt}
          </p>

          {/* Body */}
          <div>{renderContent(post.content)}</div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/8">
            {post.tags.map(t => (
              <span key={t}
                className="flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full
                           bg-white/5 border border-white/10 text-gray-400">
                <Tag size={9} /> {t}
              </span>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-6 p-5 rounded-xl border"
               style={{ background: `${post.accent}10`, borderColor: `${post.accent}30` }}>
            <p className="font-display font-semibold text-white mb-1">Want to work with us?</p>
            <p className="text-sm text-gray-400 mb-3 font-body">
              PRATHOMIX builds custom AI solutions, chatbots, and SaaS products.
            </p>
            <a href="mailto:prathomix@gmail.com"
               className="inline-flex items-center gap-2 text-sm font-mono transition-colors
                          underline underline-offset-4"
               style={{ color: post.accent }}>
              prathomix@gmail.com
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PostCard({ post, index, onRead }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl overflow-hidden group hover:-translate-y-1 hover:border-white/15
                 transition-all duration-300 border border-white/8"
    >
      <div className="flex">
        {/* Left colour bar */}
        <div className={`w-1 bg-gradient-to-b ${post.color} flex-shrink-0`} />

        <div className="p-5 flex-1 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider"
                  style={{ color: post.accent }}>{post.category}</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs font-mono text-gray-500">
              <Clock size={9} /> {post.readTime}
            </span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-xs font-mono text-gray-500">
              {new Date(post.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-gray-600 ml-auto">
              <Eye size={9} /> {post.views}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-display font-bold text-white text-lg leading-snug mb-2
                         group-hover:text-brand-200 transition-colors duration-200">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 font-body">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(t => (
                <span key={t}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full
                             bg-white/5 border border-white/10 text-gray-500">
                  <Tag size={8} /> {t}
                </span>
              ))}
            </div>
            <button onClick={() => onRead(post)}
              className="flex items-center gap-1.5 text-xs font-mono font-medium
                         hover:gap-2.5 transition-all duration-200 group/btn"
              style={{ color: post.accent }}>
              Read article
              <ArrowRight size={12} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function Blog() {
  const [category, setCategory] = useState('All')
  const [query,    setQuery]    = useState('')
  const [openPost, setOpenPost] = useState(null)

  const filtered = POSTS.filter(p => {
    const catOk = category === 'All' || p.category === category
    const q     = query.toLowerCase()
    const qOk   = !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    return catOk && qOk
  })

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0.05)} className="text-center mb-12">
          <span className="tag mb-4 inline-flex"><BookOpen size={10} /> PRATHOMIX Blog</span>
          <h1 className="section-heading mb-4">
            Engineering <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-body">
            Deep-dives on AI, FastAPI, React, and building production SaaS.
          </p>
        </motion.div>

        {/* Search + filters */}
        <motion.div {...fadeUp(0.1)} className="mb-8 space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search articles…" className="input-field pl-11 pr-10"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:text-white transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 ${
                  category === c
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                    : 'text-gray-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        {filtered.length === 0 ? (
          <motion.div {...fadeUp(0)} className="text-center py-16 glass rounded-2xl border border-white/8">
            <BookOpen size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-display font-semibold mb-2">No articles found</p>
            <p className="text-gray-600 text-sm">Try a different search term or category.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="sync">
              {filtered.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} onRead={setOpenPost} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Subscribe CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mt-14 glass rounded-2xl p-8 text-center border border-white/8"
        >
          <Zap size={28} className="text-brand-400 mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Never miss a post</h2>
          <p className="text-gray-400 text-sm mb-5 font-body">
            Engineering insights and product launches — straight to your inbox.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input type="email" placeholder="you@example.com" className="input-field flex-1" />
            <button className="btn-primary text-sm px-5 flex-shrink-0">Subscribe</button>
          </div>
        </motion.div>
      </div>

      {/* Article modal */}
      <AnimatePresence>
        {openPost && (
          <ArticleModal post={openPost} onClose={() => setOpenPost(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}