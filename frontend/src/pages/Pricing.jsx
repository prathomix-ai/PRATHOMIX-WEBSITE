import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Sparkles, Building2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const PLANS = [
  {
    name: 'Starter',
    icon: Zap,
    monthly: 0,
    yearly: 0,
    desc: 'Good for trying PRATHOMIX.',
    color: 'from-gray-400 to-gray-600',
    badge: null,
    features: [
      'NexusBot basic access',
      '100 chatbot replies / month',
      'Community support',
      'Basic analytics',
      '1 workspace',
    ],
    cta: 'Get Started Free',
    to: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    monthly: 49,
    yearly: 39,
    desc: 'For growing teams.',
    color: 'from-brand-400 to-ink-500',
    badge: 'Most Popular',
    features: [
      'Full NexusBot access',
      '10,000 chatbot replies / month',
      'FlowMind automation (beta)',
      'Priority support (12h)',
      '10 workspaces',
      'Custom chatbot style',
      'API access',
      'Advanced analytics',
    ],
    cta: 'Start Pro Trial',
    to: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    monthly: null,
    yearly: null,
    desc: 'For large teams.',
    color: 'from-amber-400 to-orange-500',
    badge: 'Custom',
    features: [
      'Unlimited AI usage',
      'All products included',
      'Dedicated support engineer',
      '99.9% uptime SLA',
      'On-premise option',
      'Custom model tuning',
      'SAML SSO / SCIM',
      'Compliance reports',
    ],
    cta: 'Contact Sales',
    to: '/contact',
    highlight: false,
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Pricing" description="Transparent, fair pricing for PRATHOMIX AI tools. Start free." />
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="tag mb-4 inline-flex"><Sparkles size={10} /> Pricing</span>
          <h1 className="section-heading mb-4">
            Simple{' '}
            <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            No hidden fees. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
                !yearly ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 flex items-center gap-2 ${
                yearly ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(({ name, icon: Icon, monthly, yearly: yr, desc, color, badge, features, cta, to, highlight }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative glass rounded-2xl p-6 flex flex-col ${
                highlight ? 'border-brand-500/30 shadow-2xl shadow-brand-500/10' : 'border-white/8'
              } border`}
            >
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full bg-gradient-to-r ${color} text-white shadow-lg`}>
                    {badge}
                  </span>
                </div>
              )}

              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} p-0.5 mb-4`}>
                <div className="w-full h-full rounded-[14px] bg-gray-950/80 flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
              </div>

              <p className="font-display font-bold text-xl text-white">{name}</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">{desc}</p>

              <div className="mb-6">
                {monthly === null ? (
                  <p className="font-display font-bold text-3xl text-white">Custom</p>
                ) : monthly === 0 ? (
                  <p className="font-display font-bold text-3xl text-white">Free</p>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="font-display font-bold text-4xl text-white">
                      ${yearly ? yr : monthly}
                    </span>
                    <span className="text-gray-500 text-sm mb-1 font-mono">/mo</span>
                  </div>
                )}
                {yearly && yr !== null && monthly !== null && monthly > 0 && (
                  <p className="text-xs text-green-400 font-mono mt-1">
                    Billed annually · Save ${(monthly - yr) * 12}/yr
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={to}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-display font-semibold transition-all duration-200 ${
                  highlight
                    ? 'btn-primary'
                    : 'btn-ghost'
                }`}
              >
                {cta} <ArrowRight size={15} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass rounded-2xl p-8 text-center"
        >
          <p className="text-white font-display font-semibold text-lg mb-2">
            Questions about pricing?
          </p>
          <p className="text-gray-400 text-sm mb-5">
            Tell us what you need. We will suggest the right plan.
          </p>
          <Link to="/contact" className="btn-ghost inline-flex items-center gap-2 text-sm">
            Talk to us <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
