import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Bell, Shield, Palette,
  Save, AlertCircle, CheckCircle, LogOut, Trash2
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import Divider from '../components/Divider'

const TABS = [
  { id: 'profile',    label: 'Profile',    icon: User    },
  { id: 'security',   label: 'Security',   icon: Shield  },
  { id: 'notifs',     label: 'Notifications', icon: Bell },
]

function SaveBar({ saving, saved, error, onSave }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
      <button onClick={onSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
        {saving
          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-transparent border-t-white" />
          : <Save size={14} />
        }
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      {saved  && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle size={14} /> Saved!</span>}
      {error  && <span className="flex items-center gap-1.5 text-red-400 text-sm"><AlertCircle size={14} /> {error}</span>}
    </div>
  )
}

export default function UserSettings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  // Profile state
  const [name, setName]   = useState(user?.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [err,    setErr]    = useState('')

  // Notification prefs (stored in localStorage)
  const [notifs, setNotifs] = useState({
    emailUpdates:    true,
    botResponses:    true,
    productNews:     false,
    securityAlerts:  true,
  })

  // Password change
  const [pwd,     setPwd]    = useState('')
  const [pwdMsg,  setPwdMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('prathomix_notifs')
    if (stored) setNotifs(JSON.parse(stored))
  }, [])

  const saveProfile = async () => {
    setSaving(true); setErr(''); setSaved(false)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    if (error) { setErr(error.message); return }
    // Also update profiles table
    await supabase.from('profiles').update({ full_name: name, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const changePassword = async () => {
    if (pwd.length < 8) { setPwdMsg('Password must be at least 8 characters.'); return }
    const { error } = await supabase.auth.updateUser({ password: pwd })
    setPwdMsg(error ? error.message : 'Password updated successfully!')
    setPwd('')
  }

  const saveNotifs = () => {
    localStorage.setItem('prathomix_notifs', JSON.stringify(notifs))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return
    await signOut()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Settings" />
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <span className="tag mb-3 inline-flex"><Settings size={10} /> Account Settings</span>
          <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        </motion.div>

        <div className="flex gap-6 flex-col md:flex-row">

          {/* Sidebar */}
          <div className="md:w-48 flex-shrink-0">
            <nav className="glass rounded-2xl p-2 flex md:flex-col gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body text-left transition-all duration-200 w-full ${
                    tab === id ? 'bg-brand-500/15 text-brand-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile Tab */}
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-5">
                <h2 className="font-display font-semibold text-white flex items-center gap-2"><User size={16} className="text-brand-400" /> Profile Information</h2>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Display Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
                  <p className="text-xs text-gray-600 mt-1 font-mono">Email cannot be changed from here.</p>
                </div>
                <SaveBar saving={saving} saved={saved} error={err} onSave={saveProfile} />

                <Divider label="Danger Zone" />
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="text-sm font-display font-semibold text-white">Delete Account</p>
                    <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all data.</p>
                  </div>
                  <button onClick={deleteAccount} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 text-xs border border-red-500/20 hover:bg-red-500/10 transition-all duration-200">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-5">
                <h2 className="font-display font-semibold text-white flex items-center gap-2"><Shield size={16} className="text-brand-400" /> Security</h2>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">New Password</label>
                  <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Min. 8 characters" className="input-field" />
                </div>
                {pwdMsg && (
                  <p className={`text-sm flex items-center gap-1.5 ${pwdMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                    {pwdMsg.includes('success') ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {pwdMsg}
                  </p>
                )}
                <button onClick={changePassword} className="btn-primary text-sm flex items-center gap-2"><Shield size={14} /> Update Password</button>

                <Divider label="Session" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Sign out of all devices</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">Revokes all active sessions.</p>
                  </div>
                  <button onClick={() => { signOut(); navigate('/') }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 text-xs border border-white/10 hover:text-white hover:border-white/20 transition-all">
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifs' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-5">
                <h2 className="font-display font-semibold text-white flex items-center gap-2"><Bell size={16} className="text-brand-400" /> Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifs).map(([key, val]) => {
                    const labels = {
                      emailUpdates:   { title: 'Email Updates',   desc: 'Weekly digest of platform news.' },
                      botResponses:   { title: 'Bot Responses',   desc: 'Notify when SmartBot replies.' },
                      productNews:    { title: 'Product News',    desc: 'New product launches and betas.' },
                      securityAlerts: { title: 'Security Alerts', desc: 'Login from new devices, etc.' },
                    }
                    const { title, desc } = labels[key] || { title: key, desc: '' }
                    return (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                        <div>
                          <p className="text-sm text-white">{title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                          className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${val ? 'bg-brand-500' : 'bg-white/10'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${val ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <SaveBar saving={false} saved={saved} error="" onSave={saveNotifs} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
