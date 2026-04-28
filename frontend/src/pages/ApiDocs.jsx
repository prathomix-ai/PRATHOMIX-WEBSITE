import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Zap, ChevronDown, ExternalLink, Copy, Check } from 'lucide-react'
import SEO from '../components/SEO'
import CodeBlock from '../components/CodeBlock'

const BASE_URL = 'https://api.prathomix.xyz'

const ENDPOINTS = [
  {
    group: 'SmartBot',
    color: 'from-brand-400 to-teal-400',
    routes: [
      {
        method: 'POST',
        path: '/api/chatbot/chat',
        desc: 'Send a message to the PRATHOMIX SmartBot. Uses Groq for intent parsing and Gemini for complex reasoning.',
        auth: false,
        body: `{
  "message": "What AI services do you offer?",
  "user_id": "optional-uuid"
}`,
        response: `{
  "response": "We specialise in AI chatbot development...",
  "intent": "service_info",
  "source": "groq"
}`,
      },
    ],
  },
  {
    group: 'Projects',
    color: 'from-ink-400 to-violet-400',
    routes: [
      {
        method: 'GET',
        path: '/api/projects/',
        desc: 'List all public projects. Supports pagination via limit and offset.',
        auth: false,
        body: null,
        response: `{
  "projects": [
    {
      "id": "uuid",
      "name": "NexusBot",
      "description": "...",
      "github_url": "https://github.com/...",
      "tags": ["AI", "FastAPI"],
      "created_at": "2025-06-01T00:00:00Z"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/api/projects/',
        desc: 'Create a new project. Requires admin JWT in Authorization header.',
        auth: true,
        body: `{
  "name": "SprintKit",
  "description": "AI project manager",
  "github_url": "https://github.com/prathomix/sprintkit",
  "tags": ["AI", "Productivity"]
}`,
        response: `{ "project": { "id": "uuid", "name": "SprintKit", ... } }`,
      },
    ],
  },
  {
    group: 'Contact',
    color: 'from-amber-400 to-orange-400',
    routes: [
      {
        method: 'POST',
        path: '/api/contact/',
        desc: 'Submit a contact form. Stored in Supabase and triggers a confirmation email.',
        auth: false,
        body: `{
  "name": "Arjun",
  "email": "arjun@startup.com",
  "subject": "Partnership enquiry",
  "message": "Hi, I'd like to discuss..."
}`,
        response: `{
  "message": "Thank you! We will respond within 24 hours.",
  "company_email": "prathomix@gmail.com"
}`,
      },
    ],
  },
  {
    group: 'Analytics',
    color: 'from-emerald-400 to-cyan-400',
    routes: [
      {
        method: 'POST',
        path: '/api/analytics/event',
        desc: 'Track an anonymous analytics event. No PII stored — session_id should be a hashed fingerprint.',
        auth: false,
        body: `{
  "event": "cta_clicked",
  "page": "/pricing",
  "properties": { "variant": "pro_yearly" },
  "session_id": "abc123"
}`,
        response: `{ "ok": true }`,
      },
    ],
  },
]

const METHOD_COLORS = {
  GET:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  POST:   'bg-brand-500/15   text-brand-400   border-brand-500/20',
  PATCH:  'bg-amber-500/15   text-amber-400   border-amber-500/20',
  DELETE: 'bg-red-500/15     text-red-400     border-red-500/20',
}

function EndpointCard({ route }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <span className={`text-xs font-mono px-2 py-0.5 rounded border flex-shrink-0 ${METHOD_COLORS[route.method] || ''}`}>
          {route.method}
        </span>
        <code className="text-sm font-mono text-white flex-1 min-w-0 truncate">{route.path}</code>
        {route.auth && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
            Auth required
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-500 flex-shrink-0">
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/5 p-4 space-y-4"
        >
          <p className="text-sm text-gray-400">{route.desc}</p>
          {route.body && (
            <div>
              <p className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Request Body</p>
              <CodeBlock code={route.body} language="json" />
            </div>
          )}
          <div>
            <p className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Response</p>
            <CodeBlock code={route.response} language="json" />
          </div>
          <CodeBlock
            code={`curl -X ${route.method} ${BASE_URL}${route.path} \\
  -H "Content-Type: application/json" \\${route.auth ? '\n  -H "Authorization: Bearer YOUR_JWT" \\' : ''}${route.body ? `\n  -d '${route.body.replace(/\n/g, ' ').replace(/  +/g, ' ')}'` : ''}`}
            language="bash"
            title="cURL example"
          />
        </motion.div>
      )}
    </div>
  )
}

export default function ApiDocs() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="API Docs" description="PRATHOMIX REST API documentation — SmartBot, Projects, Contact, Analytics." />
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="tag mb-4 inline-flex"><Code2 size={10} /> REST API</span>
          <h1 className="section-heading mb-4">
            API <span className="text-gradient">Documentation</span>
          </h1>
          <p className="text-gray-400 mb-6">
            Base URL: <code className="font-mono text-brand-300">{BASE_URL}</code>
          </p>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2 text-sm"
          >
            <Zap size={14} /> Open Swagger UI <ExternalLink size={12} />
          </a>
        </motion.div>

        {/* Auth note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 mb-8 border border-amber-500/15"
        >
          <p className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">Authentication</p>
          <p className="text-sm text-gray-400">
            Protected endpoints require a Supabase JWT in the{' '}
            <code className="font-mono text-white bg-white/8 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code>{' '}
            header. Get your token from <code className="font-mono text-brand-300">supabase.auth.getSession()</code>.
          </p>
        </motion.div>

        {/* Endpoints */}
        <div className="space-y-8">
          {ENDPOINTS.map(({ group, color, routes }, gi) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: gi * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-0.5 w-6 rounded-full bg-gradient-to-r ${color}`} />
                <p className={`text-xs font-mono uppercase tracking-widest bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {group}
                </p>
              </div>
              <div className="space-y-3">
                {routes.map(r => <EndpointCard key={r.path + r.method} route={r} />)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* SDKs note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass rounded-2xl p-6 text-center"
        >
          <Code2 size={28} className="text-brand-400 mx-auto mb-3" />
          <p className="text-white font-display font-semibold mb-2">Looking for SDKs?</p>
          <p className="text-gray-400 text-sm mb-4">
            Our Python and JavaScript SDK wrappers are coming soon. For now, use the REST API directly
            or reach out and we'll help you integrate.
          </p>
          <a href="mailto:prathomix@gmail.com" className="text-brand-300 text-sm hover:underline underline-offset-4 font-mono">
            prathomix@gmail.com
          </a>
        </motion.div>
      </div>
    </div>
  )
}
