import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Calendar, MessageSquare, Shield,
  Settings, Activity, Clock, TrendingUp, Code2,
  ExternalLink, Zap, Globe,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import SEO from '../components/SEO'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function UserProfile() {
  const { user, isAdmin } = useAuth()
  const [queries, setQueries]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      setQueries([])
      setProfileData({ plan: 'Free' })
      setLoading(false)
      return
    }

    // fetch chatbot logs
    supabase
      .from('chatbot_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { setQueries(data || []); setLoading(false) })

    // fetch profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfileData(data ? { ...data, plan: data.plan || 'Free' } : { plan: 'Free' })
      })
  }, [user])

  const joinDateSource = user?.created_at || profileData?.created_at
  const joinDate = joinDateSource
    ? new Date(joinDateSource).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'N/A'

  const displayName =
    user?.user_metadata?.full_name ||
    profileData?.full_name ||
    user?.email?.split('@')[0] ||
    'PRATHOMIX User'

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Profile" />
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Profile hero card ──────────────────────────── */}
        <motion.div {...fadeUp(0)} className="glass rounded-2xl p-6 md:p-8 border border-white/8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-ink-500
                              flex items-center justify-center text-2xl font-display font-black
                              text-white shadow-xl shadow-brand-500/20">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full
                               border-2 border-gray-950 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-950" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-2xl text-white">{displayName}</h1>
                {isAdmin && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full
                                   bg-brand-500/15 text-brand-300 border border-brand-500/25">
                    Admin
                  </span>
                )}
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full
                                 bg-green-500/10 text-green-400 border border-green-500/20">
                  ● Active
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {profileData?.plan || 'Free'} Plan
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-brand-400" />
                  {user?.email || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-ink-400" />
                  Member since {joinDate}
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link to="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                           text-gray-300 hover:text-white hover:border-brand-500/30 hover:bg-brand-500/5
                           transition-all duration-200 text-sm font-body">
                <Settings size={14} /> Settings
              </Link>
              {isAdmin && (
                <Link to="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                             btn-primary text-sm justify-center">
                  <Zap size={14} /> Admin Panel
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats row ───────────────────────────────────── */}
        <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'AI Queries',      value: queries.length,                          icon: MessageSquare, color: 'text-brand-400'  },
            { label: 'This Month',      value: queries.filter(q => {
                const d = new Date(q.created_at)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length,                                                                 icon: TrendingUp,    color: 'text-ink-400'    },
            { label: 'Resolved',        value: queries.filter(q => q.resolved).length,  icon: Shield,        color: 'text-green-400'  },
            { label: 'Active Since',    value: new Date(user?.created_at || Date.now()).getFullYear(), icon: Calendar, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label}
              className="glass rounded-xl p-4 text-center border border-white/8
                         hover:border-white/12 transition-all duration-200">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-xs font-mono text-gray-500 mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Account details ─────────────────────────────── */}
        <motion.div {...fadeUp(0.14)} className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <User size={16} className="text-brand-400" /> Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name',    value: displayName,   icon: User    },
              { label: 'Email',        value: user?.email || 'N/A',   icon: Mail    },
              { label: 'User ID',      value: user?.id || 'N/A', icon: Shield },
              { label: 'Plan',         value: profileData?.plan || 'Free', icon: Zap },
              { label: 'Member Since', value: joinDate,      icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-brand-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm text-white truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── What you can do ─────────────────────────────── */}
        <motion.div {...fadeUp(0.18)} className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <Zap size={16} className="text-ink-400" /> Explore PRATHOMIX
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Code2, title: 'Our Products',
                desc: 'Explore AI tools built by PRATHOMIX',
                to: '/products', color: 'text-brand-400', bg: 'bg-brand-500/10',
              },
              {
                icon: Globe, title: 'Services',
                desc: 'What we can build for your business',
                to: '/services', color: 'text-ink-400', bg: 'bg-ink-500/10',
              },
              {
                icon: MessageSquare, title: 'Talk to Mix',
                desc: 'Ask our AI anything about PRATHOMIX',
                to: null, color: 'text-amber-400', bg: 'bg-amber-500/10',
                action: () => document.querySelector('[aria-label="Open Mix AI"]')?.click(),
              },
            ].map(({ icon: Icon, title, desc, to, color, bg, action }) => (
              to ? (
                <Link key={title} to={to}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/5
                             hover:bg-white/6 hover:border-white/10 transition-all duration-200 group">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white text-sm group-hover:text-brand-300
                                  transition-colors flex items-center gap-1">
                      {title} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </Link>
              ) : (
                <button key={title} onClick={action}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/5
                             hover:bg-white/6 hover:border-white/10 transition-all duration-200 group text-left w-full">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              )
            ))}
          </div>
        </motion.div>

        {/* ── Recent Bot Queries ──────────────────────────── */}
        <motion.div {...fadeUp(0.22)} className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <Activity size={16} className="text-brand-400" /> Recent AI Conversations
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-6 h-6 rounded-full border-2 border-transparent border-t-brand-400" />
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-body">No conversations yet.</p>
              <p className="text-gray-600 text-xs mt-1">
                Click the chat button to talk to Mix, our AI agent.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queries.map(q => (
                <div key={q.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5
                             hover:bg-white/5 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare size={12} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-relaxed">{q.query}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {q.intent && (
                        <span className="text-[10px] font-mono text-gray-600 capitalize">
                          {q.intent.replace(/_/g, ' ')}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(q.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}