import React from 'react'
import { motion } from 'framer-motion'
import { Store, Navigation, Code, Shield, FileText, ShoppingCart, Stethoscope, Scissors, ExternalLink } from 'lucide-react'

const PRODUCTS = [
  {
    icon: Store,
    name: 'Prathomix Resto (SaaS)',
    tagline: 'Next-Gen Restaurant AI',
    description: 'An ultra-intelligent restaurant platform with AI chatbots, generative UI, and voice-activated ordering systems.',
    status: 'Live',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    color: 'from-emerald-400 to-teal-400',
    link: 'https://prathomix-resturant-solution.vercel.app/',
    features: ['Voice Ordering', 'AI Fallback', 'QR Split-Bill', 'AI Auto-Pilot', 'Admin Console'],
  },
  {
    icon: Navigation,
    name: 'Travojo',
    tagline: 'Travel & Safety Ecosystem',
    description: 'A disruptive, hyper-local safety web app combining intelligent maps with real-time AI travel assistance.',
    status: 'Upcoming',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    color: 'from-purple-400 to-indigo-400',
    link: '#',
    features: ['Smart Routing maps', 'AI Travel Bot', 'Hyper-local Safety', 'Live Navigation'],
  },
  {
    icon: Code,
    name: 'Nexura',
    tagline: 'AI Coding Practice Lab',
    description: 'An animated, highly interactive platform for mastering Python and system logic with gamified practice modules.',
    status: 'Upcoming',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    color: 'from-blue-400 to-cyan-400',
    link: '#',
    features: ['Python Focused', 'Logic Building', 'Gamified UI', 'Instant Feedback'],
  },
  {
    icon: Shield,
    name: 'Security Shield',
    tagline: 'Real-time Phishing Protection',
    description: 'An AI-powered browser extension that detects typosquatting and blocks malicious phishing sites instantly.',
    status: 'Live',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    color: 'from-rose-400 to-red-400',
    link: '#',
    features: ['Typosquatting Detection', 'Fast JS Execution', 'Browser Integration', 'Real-time Alerts'],
  },
  {
    icon: FileText,
    name: 'DocuMind AI',
    tagline: 'Chat with your PDFs',
    description: 'Upload multiple documents and ask questions in natural language. Powered by powerful open-source models.',
    status: 'Live',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    color: 'from-amber-400 to-orange-400',
    link: '#',
    features: ['Multi-PDF Upload', 'LangChain Integrated', 'Hugging Face', '100% Free & Local'],
  },
  {
    icon: Scissors,
    name: 'URBAN CUTS',
    tagline: 'Smart Salon Management System',
    description: 'A seamless appointment booking platform designed for modern salons, featuring real-time scheduling and a beautiful UI.',
    status: 'Beta',
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    color: 'from-pink-400 to-rose-400',
    link: 'https://prathomixsalon.netlify.app/',
    features: ['Instant Booking', 'Service Catalog', 'Staff Management', 'Smooth Animations'],
  },
  {
    icon: Stethoscope, 
    name: 'Medical AI Assistant', 
    tagline: 'AI-Powered Medical Diagnostician', 
    description: 'An advanced AI that analyzes messy prescriptions and complex lab reports, explaining them simply in English, Hindi, or Hinglish.', 
    status: 'Live', 
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20', 
    color: 'from-rose-400 to-red-400', 
    link: '#', 
    features: ['Smart Vision Engine', 'Hinglish Explanations', 'Instant PDF Export', 'Auto-Fallback API'], 
  },
]


export default function Products() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-flex">AI Tools</span>
          <h1 className="section-heading mb-4">
            Products Built for{' '}
            <span className="text-gradient">Real Work</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each product solves a real problem with simple, useful AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PRODUCTS.map(({ icon: Icon, name, tagline, description, status, badge, color, link, features }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-hover rounded-2xl p-6 flex flex-col group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} p-0.5`}>
                  <div className="w-full h-full rounded-[14px] bg-gray-950/80 flex items-center justify-center">
                    <Icon size={22} className="text-white" />
                  </div>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${badge}`}>
                  {status}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-white mb-1">{name}</h2>
              <p className={`text-xs font-mono bg-gradient-to-r ${color} bg-clip-text text-transparent mb-3`}>
                {tagline}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5">{description}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={link}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm font-body text-gray-300 hover:text-white hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-200"
              >
                Explore Product <ExternalLink size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
