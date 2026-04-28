import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, Github, MessageSquare,
  Users, FolderOpen, Plus, ExternalLink, Trash2, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [leads, setLeads]         = useState([])
  const [projects, setProjects]   = useState([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  // New project form
  const [projName, setProjName] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projGithub, setProjGithub] = useState('')
  const [projMsg, setProjMsg] = useState('')

  useEffect(() => {
    fetchLeads()
    fetchProjects()
  }, [])

  async function fetchLeads() {
    const { data } = await supabase.from('chatbot_logs').select('*').order('created_at', { ascending: false }).limit(50)
    setLeads(data || [])
    setLoadingLeads(false)
  }

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
  }

  async function addProject(e) {
    e.preventDefault()
    setProjMsg('')
    const { error } = await supabase.from('projects').insert([{
      name: projName, description: projDesc, github_url: projGithub
    }])
    if (error) { setProjMsg('Error: ' + error.message); return }
    setProjMsg('Project added!')
    setProjName(''); setProjDesc(''); setProjGithub('')
    fetchProjects()
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchProjects()
  }

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'projects',  label: 'Projects',  icon: FolderOpen      },
    { id: 'leads',     label: 'Leads',     icon: MessageSquare   },
  ]

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <span className="tag mb-3 inline-flex"><LayoutDashboard size={10} /> Admin Panel</span>
          <h1 className="font-display font-bold text-3xl text-white">PRATHOMIX Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage projects, leads, and platform content.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 glass rounded-xl p-1.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                activeTab === id ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:text-white'
              }`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Total Leads',    value: leads.length,    icon: Users,       color: 'text-brand-400'  },
              { label: 'Projects',       value: projects.length, icon: FolderOpen,  color: 'text-ink-400'    },
              { label: 'Unresolved',     value: leads.filter(l => !l.resolved).length, icon: AlertCircle, color: 'text-amber-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 text-center">
                <Icon size={28} className={`${color} mx-auto mb-3`} />
                <p className="font-display font-bold text-3xl text-white">{value}</p>
                <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Add Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
                <Plus size={18} className="text-brand-400" /> Add New Project
              </h2>
              <form onSubmit={addProject} className="space-y-4">
                <input required value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name" className="input-field" />
                <textarea required value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Description" rows={3} className="input-field resize-none" />
                <div className="relative">
                  <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={projGithub} onChange={e => setProjGithub(e.target.value)} placeholder="GitHub URL (optional)" className="input-field pl-10" />
                </div>
                {projMsg && <p className={`text-sm ${projMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{projMsg}</p>}
                <button type="submit" className="btn-primary flex items-center gap-2"><Upload size={15} /> Add Project</button>
              </form>
            </motion.div>

            {/* Projects List */}
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-white">{p.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{p.description}</p>
                    {p.github_url && (
                      <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-brand-300 mt-2 hover:underline">
                        <Github size={12} /> View on GitHub <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <button onClick={() => deleteProject(p.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No projects yet.</p>}
            </div>
          </div>
        )}

        {/* Leads */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-400" /> All Chatbot Leads
            </h2>
            {loadingLeads ? (
              <p className="text-gray-500 text-sm text-center py-6">Loading…</p>
            ) : leads.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No leads yet.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {leads.map(l => (
                  <div key={l.id} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-sm text-white flex-1">{l.query}</p>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${l.resolved ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                        {l.resolved ? 'resolved' : 'open'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {l.user_id && <span className="text-xs font-mono text-gray-600">uid: {l.user_id.slice(0, 8)}…</span>}
                      <span className="text-xs font-mono text-gray-600">{new Date(l.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
