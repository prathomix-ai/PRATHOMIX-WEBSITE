import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Send, MapPin, Clock, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import api from '../lib/api'
import SEO from '../components/SEO'

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Company Email',
    value: 'prathomix@gmail.com',
    href: 'mailto:prathomix@gmail.com',
    desc: 'General questions and work',
    color: 'text-brand-300',
  },
  {
    icon: Mail,
    label: 'Founder Direct',
    value: 'founder.prathomix@gmail.com',
    href: 'mailto:founder.prathomix@gmail.com',
    desc: 'Talk directly with Pratham',
    color: 'text-ink-300',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat with us now',
    href: 'https://wa.me/919887754009',
    desc: 'Fast reply',
    color: 'text-green-400',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '9887754009',
    href: 'tel:+919887754009',
    desc: 'Call us directly',
    color: 'text-brand-300',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 hours',
    href: null,
    desc: 'Mon–Sat, 9 AM–8 PM IST',
    color: 'text-amber-400',
  },
]

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus]   = useState(null)   // null | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg]   = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrMsg(err?.response?.data?.detail || 'Something went wrong. Please email us directly.')
    }
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Contact" description="Get in touch with PRATHOMIX — AI solutions for your business." />
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-flex"><MapPin size={10} /> Get In Touch</span>
          <h1 className="section-heading mb-4">
            Let's Build Something{' '}
            <span className="text-gradient">Simple</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a project or a question? Send a message and we will reply.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Contact Methods */}
          <div className="space-y-4">
            {CONTACT_METHODS.map(({ icon: Icon, label, value, href, desc, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-hover rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                       rel="noopener noreferrer"
                       className={`font-body font-medium ${color} hover:underline underline-offset-4 transition-colors`}>
                      {value}
                    </a>
                  ) : (
                    <p className={`font-body font-medium ${color}`}>{value}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <MapPin size={28} className="text-brand-400 mx-auto mb-3" />
              <p className="text-white font-display font-semibold">Operating Office</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">Jaipur, Rajasthan, India</p>
              <p className="text-white font-display font-semibold mt-4">Registered Office</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">Garhwa, Jharkhand, India - 822114</p>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <h2 className="font-display font-semibold text-white mb-6">Send a Message</h2>

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <CheckCircle size={48} className="text-green-400 mb-4" />
                <p className="font-display font-semibold text-white text-xl mb-2">Message Sent!</p>
                <p className="text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus(null)}
                  className="mt-6 btn-ghost text-sm"
                >
                  Send another
                </button>
              </motion.div>
            )}

            {status !== 'success' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
                    <input required value={form.name} onChange={set('name')} placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Subject</label>
                    <input value={form.subject} onChange={set('subject')} placeholder="What is this about?" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea required value={form.message} onChange={set('message')} placeholder="Tell us what you need…" rows={5} className="input-field resize-none" />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    {errMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {status === 'loading' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-transparent border-t-white"
                    />
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
