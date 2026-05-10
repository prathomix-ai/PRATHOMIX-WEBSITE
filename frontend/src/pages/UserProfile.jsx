import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, MessageSquare, Shield, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function UserProfile() {
  const { user } = useAuth()
  const [queries, setQueries] = useState([])
  const [loadingQ, setLoadingQ] = useState(true)

  useEffect(() => {
    async function fetchQueries() {
      if (!user) return
      const { data } = await supabase
        .from('chatbot_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setQueries(data || [])
      setLoadingQ(false)
    }
    fetchQueries()
  }, [user])

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                {user?.user_metadata?.full_name || 'PRATHOMIX User'}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
                <Mail size={13} className="text-brand-400" />{user?.email}
              </p>
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5 font-mono">
                <Calendar size={12} /> Member since {joinDate}
              </p>
            </div>
            <div className="sm:ml-auto">
              <span className="tag"><Shield size={10} /> Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-brand-400" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-white font-medium">Privacy &amp; Security:</span> To protect your data, all AI chat history is automatically deleted from our servers every 7 days. We prioritize your privacy over long-term storage.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Queries Sent',   value: queries.length, icon: MessageSquare },
            { label: 'Days Active',    value: '—',            icon: Calendar      },
            { label: 'Plan',           value: 'Free',         icon: Shield        },
            { label: 'Integrations',   value: '0',            icon: Settings      },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <Icon size={18} className="text-brand-400 mx-auto mb-2" />
              <p className="font-display font-bold text-xl text-white">{value}</p>
              <p className="text-xs font-mono text-gray-500 mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <MessageSquare size={18} className="text-brand-400" /> Recent Bot Queries
          </h2>
          {loadingQ ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-6 h-6 rounded-full border-2 border-transparent border-t-brand-400" />
            </div>
          ) : queries.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No queries yet. Try asking the SmartBot something!</p>
          ) : (
            <div className="space-y-3">
              {queries.map(q => (
                <div key={q.id} className="glass rounded-xl p-4">
                  <p className="text-sm text-white">{q.query}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    {new Date(q.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
