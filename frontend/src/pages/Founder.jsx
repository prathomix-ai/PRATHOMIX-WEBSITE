import React from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Globe, Github, Linkedin, Twitter,
  Code2, Brain, Rocket, Layers, Award
} from 'lucide-react'

const SKILLS = [
  "AI / LLM Architecture",
  "Full-Stack Engineering",
  "React & Next.js",
  "FastAPI + Python",
  "Supabase / Postgres",
  "Cloud Deployment",
]

const LINKS = [
  { icon: Mail,     label: 'Personal',      href: 'mailto:founder.prathomix@gmail.com', value: 'founder.prathomix@gmail.com',  color: 'text-brand-300' },
  { icon: Mail,     label: 'Company',       href: 'mailto:prathomix@gmail.com',         value: 'prathomix@gmail.com',          color: 'text-ink-300'   },
  { icon: Github,   label: 'GitHub',        href: 'https://github.com/prathomix', value: 'github.com/prathomix',  color: 'text-gray-300'  },
  { icon: Linkedin, label: 'LinkedIn',      href: 'https://www.linkedin.com/company/prathomix',                             value: 'linkedin.com/in/pratham', color: 'text-sky-300' },
  { icon: Twitter,  label: 'Twitter',       href: '#',                             value: '@prathomix',             color: 'text-sky-400'   },
  { icon: Globe,    label: 'Website',       href: 'https://prathomix.xyz',        value: 'prathomix.xyz',          color: 'text-teal-300'  },
]

const TIMELINE = [
  { year: 'Early 2025', title: 'The Shift to AI',      desc: "Realized that traditional software development was too slow. Started exploring Generative AI, modern web stacks, and focusing on logic building over manual syntax typing." },
  { year: 'Late 2025', title: 'Rapid Prototyping',  desc: "Leveraged AI-assisted development to drastically speed up execution. Built the first functional prototypes, focusing on solving real problems through intuitive UI and solid architecture." },
  { year: 'Early 2026', title: 'Mastering the Stack',      desc: "Moved from basic scripts to complex, full-stack applications like Nexura and Travojo. Integrated databases, authentication, and custom AI models into seamless user experiences." },
  { year: 'Mid 2026', title: 'Launching PRATHOMIX',        desc: "Combined speed, modern tech, and AI efficiency to launch an independent laboratory. Now building custom software and automations for businesses that need fast, reliable results." },
]

export default function Founder() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-ink-700/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-brand-400 to-ink-500 flex items-center justify-center text-4xl font-display font-bold text-white shadow-2xl">
                P
              </div>
              <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse-slow" />
            </div>
            <div>
              <span className="tag mb-3 inline-flex"><Award size={10} /> Founder</span>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-2">Pratham Kumar Singh</h1>
              <p className="text-gradient font-display font-semibold text-lg mb-3">Founder & AI Architect</p>
              <p className="text-gray-400 leading-relaxed max-w-xl">
                I am a Full-Stack AI Engineer specializing in Generative AI and scalable web systems.
                I founded PRATHOMIX to bridge the gap between complex machine learning technology 
                and real-world business solutions. I build fast, secure, and smart tools that actually save
                time.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Code2 size={18} className="text-brand-400" />
              <h2 className="font-display font-semibold text-white">Technical Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </motion.div>

          {/* What I Believe */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Brain size={18} className="text-ink-400" />
              <h2 className="font-display font-semibold text-white">Philosophy</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: Rocket, text: "I believe in rapid prototyping. We move fast from idea to a working product without corporate delays." },
                { icon: Brain,  text: "AI should not be complicated. I focus on building simple, intuitive interfaces hiding powerful engines underneath." },
                { icon: Layers, text: "Good architecture matters. I write clean, modern code that grows seamlessly as your business scales." },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Contact Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <Mail size={18} className="text-brand-400" /> Get in Touch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {LINKS.map(({ icon: Icon, label, href, value, color }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="glass-hover rounded-xl p-3.5 flex items-center gap-3 group"
              >
                <Icon size={16} className={`${color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-mono text-gray-500 mb-0.5">{label}</p>
                  <p className={`text-sm font-body truncate ${color} group-hover:underline`}>{value}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
            <Rocket size={18} className="text-brand-400" /> Journey
          </h2>
          <div className="relative pl-6 border-l border-white/10 space-y-8">
            {TIMELINE.map(({ year, title, desc }, i) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <span className="absolute -left-[25px] w-3 h-3 rounded-full bg-brand-400 border-2 border-gray-950" />
                <span className="text-xs font-mono text-brand-400">{year}</span>
                <p className="font-display font-semibold text-white mt-0.5">{title}</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
