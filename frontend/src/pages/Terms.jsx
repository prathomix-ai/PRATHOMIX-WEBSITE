import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the PRATHOMIX platform ("Service"), you agree to be bound by
these Terms of Use. If you do not agree, do not use the Service. We reserve the right to
update these terms at any time with notice to registered users.`,
  },
  {
    title: '2. Permitted Use',
    body: `You may use PRATHOMIX for lawful purposes only. You agree not to: reverse-engineer
the platform; attempt to access other users' data; use the AI tools to generate harmful,
illegal, or misleading content; scrape or bulk-download platform data; or resell access
without our written consent.`,
  },
  {
    title: '3. Intellectual Property',
    body: `All platform code, design, branding, and content produced by PRATHOMIX is our
intellectual property. AI-generated outputs produced by the SmartBot in response to your
queries are licensed to you for your own use. You retain ownership of content you submit.`,
  },
  {
    title: '4. AI Services Disclaimer',
    body: `Our AI tools (SmartBot, NexusBot) are powered by third-party models (Groq, Gemini).
AI outputs may be inaccurate or incomplete. Do not rely on AI responses for medical, legal,
financial, or safety-critical decisions. We are not liable for decisions made based on
AI-generated content.`,
  },
  {
    title: '5. Payment Terms',
    body: `Paid plans are billed in advance on a monthly or annual basis. All payments are
processed by Stripe. Fees are non-refundable except where required by law. We reserve the
right to change pricing with 30 days notice. Free tier usage is subject to rate limits.`,
  },
  {
    title: '6. Termination',
    body: `We may suspend or terminate your account for violations of these terms, non-payment,
or conduct harmful to other users. You may cancel your account at any time from the Settings
page. Upon termination, your data will be retained for 30 days then deleted per our Privacy Policy.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the maximum extent permitted by law, PRATHOMIX shall not be liable for any
indirect, incidental, special, or consequential damages arising from your use of the Service.
Our total liability shall not exceed the amount you paid us in the 3 months prior to the claim.`,
  },
  {
    title: '8. Governing Law',
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the
exclusive jurisdiction of the courts of Jaipur, Rajasthan. If any provision of these Terms is
found unenforceable, the remaining provisions remain in full force.`,
  },
  {
    title: '9. Contact',
    body: `For legal enquiries: prathomix@gmail.com
  Founder: founder.prathomix@gmail.com`,
  },
]

export default function Terms() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Terms of Use" description="PRATHOMIX Terms of Use — rules and guidelines for using the platform." />
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-ink-500/20 flex items-center justify-center">
              <FileText size={20} className="text-ink-400" />
            </div>
            <span className="tag">Legal</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Terms of Use</h1>
          <p className="text-gray-500 text-sm font-mono">Last updated: June 1, 2025</p>
        </motion.div>

        <div className="space-y-4">
          {SECTIONS.map(({ title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-display font-semibold text-white mb-3">{title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
