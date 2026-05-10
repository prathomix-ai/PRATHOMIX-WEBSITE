import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, MessageSquare, Plus, Trash2,
  ExternalLink, Github, Upload, AlertCircle, CheckCircle,
  Users, TrendingUp, RefreshCw, Edit3, Save, Globe,
  X, Tag, ChevronDown, ChevronUp, Clock, Check, Box,
  Zap, Activity,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '')

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

const STATUS_CFG = {
  Live:         { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/25'  },
  Beta:         { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/25'  },
  Upcoming:     { bg: 'bg-sky-500/15',    text: 'text-sky-400',    border: 'border-sky-500/25'    },
  'In Progress':{ bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/25' },
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG['In Progress']
  return (
    <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onDelete, onEdit }) {
  const [deleting, setDeleting] = useState(false)
  const tags = Array.isArray(project.tags) ? project.tags : []

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.name}"?`)) return
    setDeleting(true)
    await onDelete(project.id)
    setDeleting(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl overflow-hidden group hover:border-brand-500/30
                 hover:-translate-y-1 transition-all duration-300 border border-white/8 flex flex-col"
    >
      {/* colour strip */}
      <div className="h-1 bg-gradient-to-r from-brand-400 to-ink-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400/20 to-ink-500/20
                          border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Box size={18} className="text-brand-400" />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <StatusBadge status={project.status || 'Live'} />
            <button onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10
                         transition-colors opacity-0 group-hover:opacity-100">
              <Edit3 size={13} />
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10
                         transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30">
              {deleting
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
                    <RefreshCw size={13} />
                  </motion.div>
                : <Trash2 size={13} />}
            </button>
          </div>
        </div>

        <h3 className="font-display font-bold text-white text-base mb-0.5">{project.name}</h3>
        {project.tagline && (
          <p className="text-xs font-mono text-brand-400 mb-2">{project.tagline}</p>
        )}
        <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-3 line-clamp-3">
          {project.description || 'No description provided.'}
        </p>

        {/* tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full
                                       bg-white/5 border border-white/10 text-gray-400">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* links */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs font-mono text-gray-400
                          hover:text-white transition-colors">
              <Github size={11} /> GitHub
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs font-mono text-brand-400
                          hover:text-brand-300 transition-colors ml-auto">
              <Globe size={11} /> Live <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT MODAL (add / edit)
// ─────────────────────────────────────────────────────────────
function ProjectModal({ open, onClose, onSave, initial }) {
  const blank = { name: '', tagline: '', description: '', github_url: '', live_url: '', status: 'Live', tags: '' }
  const [form, setForm]     = useState(blank)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  useEffect(() => {
    if (!open) return
    setErr('')
    if (initial) {
      setForm({
        name:        initial.name        || '',
        tagline:     initial.tagline     || '',
        description: initial.description || '',
        github_url:  initial.github_url  || '',
        live_url:    initial.live_url    || '',
        status:      initial.status      || 'Live',
        tags:        Array.isArray(initial.tags) ? initial.tags.join(', ') : '',
      })
    } else {
      setForm(blank)
    }
  }, [initial, open])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Project name is required.'); return }
    setSaving(true); setErr('')
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    const result  = await onSave(payload, initial?.id)
    setSaving(false)
    if (result?.error) setErr(result.error)
    else onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg glass border border-white/12
                   rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-white">
            {initial ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Nexura" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={set('status')} className="input-field appearance-none cursor-pointer">
                {['Live', 'Beta', 'Upcoming', 'In Progress'].map(s =>
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Tagline</label>
            <input value={form.tagline} onChange={set('tagline')} placeholder="Short catchy line" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="What does this project do?" className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">GitHub URL</label>
              <div className="relative">
                <Github size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={form.github_url} onChange={set('github_url')}
                  placeholder="https://github.com/..." className="input-field pl-8" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Live URL</label>
              <div className="relative">
                <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={form.live_url} onChange={set('live_url')}
                  placeholder="https://..." className="input-field pl-8" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
              Tags <span className="text-gray-600 normal-case">(comma separated)</span>
            </label>
            <div className="relative">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.tags} onChange={set('tags')}
                placeholder="React, FastAPI, AI" className="input-field pl-8" />
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={14} /> {err}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
              {saving
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
                    <RefreshCw size={14} />
                  </motion.div>
                : <Save size={14} />}
              {saving ? 'Saving…' : initial ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LEAD CARD
// ─────────────────────────────────────────────────────────────
function LeadCard({ lead, onResolve, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(lead.created_at).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass rounded-xl overflow-hidden border border-white/8 hover:border-white/12 transition-all"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                lead.resolved
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {lead.resolved ? '✓ Resolved' : '● Open'}
              </span>
              {lead.intent && (
                <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-full capitalize">
                  {lead.intent.replace(/_/g, ' ')}
                </span>
              )}
              <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1 ml-auto">
                <Clock size={9} /> {date}
              </span>
            </div>
            <p className="text-sm text-white font-body leading-relaxed">{lead.query}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {lead.response && (
              <button onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
                title="View response">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {!lead.resolved && (
              <button onClick={() => onResolve(lead.id)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-green-400
                           hover:bg-green-500/10 transition-colors" title="Mark resolved">
                <Check size={14} />
              </button>
            )}
            <button onClick={() => onDelete(lead.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400
                         hover:bg-red-500/10 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && lead.response && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs font-mono text-brand-400 mb-1.5 uppercase tracking-wider">Bot Response</p>
                <p className="text-xs text-gray-400 leading-relaxed">{lead.response}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab]             = useState('overview')
  const [projects, setProjects]   = useState([])
  const [leads, setLeads]         = useState([])
  const [projLoad, setProjLoad]   = useState(true)
  const [leadsLoad, setLeadsLoad] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProj, setEditProj]   = useState(null)
  const [notify, setNotify]       = useState({ type: '', text: '' })
  const [leadsFilter, setLeadsFilter] = useState('all')

  // ── fetch helpers ────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setProjLoad(true)
    try {
      const r = await fetch(`${API_BASE}/api/projects/`)
      if (r.ok) { const d = await r.json(); setProjects(d.projects || []) }
      else throw new Error()
    } catch {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      setProjects(data || [])
    } finally { setProjLoad(false) }
  }, [])

  const fetchLeads = useCallback(async () => {
    setLeadsLoad(true)
    try {
      const { data } = await supabase
        .from('chatbot_logs').select('*')
        .order('created_at', { ascending: false }).limit(200)
      setLeads(data || [])
    } catch { setLeads([]) }
    finally { setLeadsLoad(false) }
  }, [])

  useEffect(() => { fetchProjects(); fetchLeads() }, [fetchProjects, fetchLeads])

  const toast = (type, text) => {
    setNotify({ type, text })
    setTimeout(() => setNotify({ type: '', text: '' }), 3500)
  }

  // ── save project ─────────────────────────────────────────
  const handleSaveProject = async (payload, id) => {
    try {
      const session = await supabase.auth.getSession()
      const token   = session?.data?.session?.access_token
      const url     = id ? `${API_BASE}/api/projects/${id}` : `${API_BASE}/api/projects/`
      const r = await fetch(url, {
        method:  id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      })
      if (r.status === 401 || r.status === 403) {
        // Dev fallback: direct Supabase
        if (id) await supabase.from('projects').update(payload).eq('id', id)
        else     await supabase.from('projects').insert([payload])
      } else if (!r.ok) {
        const e = await r.json().catch(() => ({}))
        return { error: e.detail || 'Failed to save.' }
      }
      toast('success', id ? 'Project updated!' : 'Project added!')
      await fetchProjects()
      return {}
    } catch (e) { return { error: e.message } }
  }

  const handleDeleteProject = async (id) => {
    try {
      const session = await supabase.auth.getSession()
      const token   = session?.data?.session?.access_token
      await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
    } catch {}
    await supabase.from('projects').delete().eq('id', id)
    setProjects(p => p.filter(x => x.id !== id))
    toast('success', 'Project deleted.')
  }

  const handleResolveLead = async (id) => {
    await supabase.from('chatbot_logs').update({ resolved: true }).eq('id', id)
    setLeads(l => l.map(x => x.id === id ? { ...x, resolved: true } : x))
  }

  const handleDeleteLead = async (id) => {
    await supabase.from('chatbot_logs').delete().eq('id', id)
    setLeads(l => l.filter(x => x.id !== id))
  }

  const stats = {
    leads:      leads.length,
    projects:   projects.length,
    unresolved: leads.filter(l => !l.resolved).length,
    resolved:   leads.filter(l =>  l.resolved).length,
  }

  const filteredLeads = leads.filter(l =>
    leadsFilter === 'all' ? true :
    leadsFilter === 'open' ? !l.resolved : l.resolved
  )

  const openLeads = leads.filter(l => !l.resolved).length

  const TABS = [
    { id: 'overview', label: 'Overview',  icon: LayoutDashboard },
    { id: 'projects', label: 'Projects',  icon: FolderOpen      },
    { id: 'leads',    label: openLeads > 0 ? `Leads (${openLeads})` : 'Leads', icon: MessageSquare },
  ]

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Page heading */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <span className="tag mb-3 inline-flex"><LayoutDashboard size={10} /> Admin Panel</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white">PRATHOMIX Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">Manage projects, leads, and platform content.</p>
        </motion.div>

        {/* Toast notification */}
        <AnimatePresence>
          {notify.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3
                          rounded-xl glass border shadow-xl text-sm font-body ${
                notify.type === 'success'
                  ? 'border-green-500/25 text-green-300'
                  : 'border-red-500/25 text-red-300'
              }`}
            >
              {notify.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {notify.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div {...fadeUp(0.08)} className="flex items-center gap-1.5 mb-8 glass rounded-xl p-1.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body
                          transition-all duration-200 ${
                tab === id
                  ? 'bg-brand-500/20 text-brand-300 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </motion.div>

        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
        {tab === 'overview' && (
          <motion.div {...fadeUp(0.12)} className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Leads',   value: stats.leads,      icon: Users,        color: 'text-brand-400',  from: 'from-brand-400', to: 'to-teal-400'    },
                { label: 'Projects',      value: stats.projects,   icon: FolderOpen,   color: 'text-ink-400',    from: 'from-ink-400',   to: 'to-violet-400'  },
                { label: 'Open Leads',    value: stats.unresolved, icon: AlertCircle,  color: 'text-amber-400',  from: 'from-amber-400', to: 'to-orange-400'  },
                { label: 'Resolved',      value: stats.resolved,   icon: CheckCircle,  color: 'text-green-400',  from: 'from-green-400', to: 'to-emerald-400' },
              ].map(({ label, value, icon: Icon, color, from, to }) => (
                <div key={label} className="glass rounded-2xl p-5 text-center border border-white/8
                                            hover:border-white/15 transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from}/15 ${to}/15
                                   border border-white/10 flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className={`font-display font-black text-4xl ${color}`}>{value}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent leads preview */}
            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-white flex items-center gap-2">
                  <Activity size={16} className="text-brand-400" /> Recent Chatbot Activity
                </h2>
                <button onClick={() => setTab('leads')}
                  className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors">
                  View all →
                </button>
              </div>
              {leads.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6 font-mono">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {leads.slice(0, 6).map(lead => (
                    <div key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                      <MessageSquare size={12} className="text-brand-400 flex-shrink-0" />
                      <p className="text-sm text-gray-300 flex-1 truncate">{lead.query}</p>
                      {lead.intent && (
                        <span className="text-[10px] font-mono text-gray-600 flex-shrink-0 hidden sm:block">
                          {lead.intent.replace(/_/g, ' ')}
                        </span>
                      )}
                      <span className={`text-xs font-mono flex-shrink-0 ${lead.resolved ? 'text-green-400' : 'text-amber-400'}`}>
                        {lead.resolved ? 'resolved' : 'open'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects mini-grid */}
            {projects.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-white flex items-center gap-2">
                    <FolderOpen size={16} className="text-ink-400" /> Projects Overview
                  </h2>
                  <button onClick={() => setTab('projects')}
                    className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors">
                    Manage all →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {projects.slice(0, 4).map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
                      <StatusBadge status={p.status || 'Live'} />
                      <p className="font-display font-semibold text-white text-sm mt-2 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{p.tagline || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ PROJECTS ══════════════════════════════════════════ */}
        {tab === 'projects' && (
          <motion.div {...fadeUp(0.1)}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-xl">Projects</h2>
                <p className="text-gray-500 text-xs font-mono mt-0.5">{projects.length} total</p>
              </div>
              <button
                onClick={() => { setEditProj(null); setShowModal(true) }}
                className="btn-primary text-sm py-2.5 flex items-center gap-2">
                <Plus size={15} /> Add Project
              </button>
            </div>

            {projLoad ? (
              <div className="flex justify-center py-16">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-8 h-8 rounded-full border-2 border-transparent border-t-brand-400 border-r-ink-400" />
              </div>
            ) : projects.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center border border-white/8 border-dashed">
                <FolderOpen size={44} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-display font-semibold text-lg mb-2">No projects yet</p>
                <p className="text-gray-600 text-sm mb-6">Add your first project to showcase your work.</p>
                <button onClick={() => { setEditProj(null); setShowModal(true) }}
                  className="btn-primary text-sm flex items-center gap-2 mx-auto">
                  <Plus size={14} /> Add First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {projects.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onDelete={handleDeleteProject}
                      onEdit={proj => { setEditProj(proj); setShowModal(true) }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ LEADS ═════════════════════════════════════════════ */}
        {tab === 'leads' && (
          <motion.div {...fadeUp(0.1)}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-semibold text-white text-xl">Chatbot Leads</h2>
                <p className="text-gray-500 text-xs font-mono mt-0.5">
                  {stats.unresolved} open · {stats.resolved} resolved · {stats.leads} total
                </p>
              </div>
              <div className="flex items-center gap-2">
                {['all', 'open', 'resolved'].map(f => (
                  <button key={f} onClick={() => setLeadsFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                      leadsFilter === f
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/25'
                        : 'text-gray-500 border border-white/8 hover:text-white hover:border-white/15'
                    }`}>
                    {f}
                  </button>
                ))}
                <button onClick={fetchLeads}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors ml-1"
                  title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {leadsLoad ? (
              <div className="flex justify-center py-16">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-8 h-8 rounded-full border-2 border-transparent border-t-brand-400 border-r-ink-400" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="glass rounded-2xl p-14 text-center border border-white/8">
                <MessageSquare size={44} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-display font-semibold">No {leadsFilter !== 'all' ? leadsFilter : ''} leads yet</p>
                <p className="text-gray-600 text-sm mt-1">Chatbot conversations will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onResolve={handleResolveLead}
                      onDelete={handleDeleteLead}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* Project modal */}
      <AnimatePresence>
        {showModal && (
          <ProjectModal
            open={showModal}
            onClose={() => { setShowModal(false); setEditProj(null) }}
            onSave={handleSaveProject}
            initial={editProj}
          />
        )}
      </AnimatePresence>
    </div>
  )
}