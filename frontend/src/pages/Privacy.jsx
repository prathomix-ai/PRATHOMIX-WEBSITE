import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly — such as your name, email address, and
messages sent through our platform. When you use our AI-powered SmartBot, the content of your
queries is processed by third-party AI providers (Groq and Google Gemini) and stored in our
Supabase database to improve our services and enable your query history.

We also collect anonymised usage data (page views, feature interactions) through our built-in
analytics system. This data contains no personally identifiable information.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `Your information is used to: provide and improve PRATHOMIX services; respond to your
enquiries; personalise your experience; send product updates (if opted in); detect and prevent
abuse; and comply with legal obligations.

We do not sell your personal data to any third parties. We do not run advertisements on our
platform. Zero-Retention & No Training: We strictly do not use your proprietary business data, prompts, or end-user interactions to train or fine-tune public AI models.`,
  },
  {
    title: 'Our Role in Data Processing',
    body: `For B2B clients, PRATHOMIX acts as a "Data Processor", while our client is the "Data Controller". We only process end-user data on behalf of our clients to provide the service. Clients are responsible for obtaining explicit consent from their customers.`,
  },
  {
    title: '3. Data Storage & Security',
    body: `Your data is stored in Supabase (PostgreSQL), hosted on infrastructure compliant with
SOC 2 Type II and ISO 27001 standards. We use Row Level Security (RLS) to ensure users can
only access their own data.

All data in transit is encrypted using TLS 1.3. Passwords are never stored — authentication
is handled by Supabase Auth using industry-standard bcrypt hashing.`,
  },
  {
    title: '4. Third-Party Services',
    body: `PRATHOMIX uses the following third-party services:
• Supabase — database and authentication (supabase.com/privacy)
• Groq — AI inference for intent parsing (groq.com/privacy)
• Google Gemini — AI for complex reasoning (policies.google.com/privacy)
• Stripe — payment processing (stripe.com/privacy)
• Resend — transactional email (resend.com/privacy)

Each provider's privacy policy governs their use of your data.`,
  },
  {
    title: '5. Cookies',
    body: `We use only essential cookies required for authentication (session tokens via Supabase
Auth). We do not use tracking cookies or third-party advertising cookies.

You may clear cookies at any time through your browser settings. Clearing session cookies will
sign you out of the platform.`,
  },
  {
    title: '6. Your Rights',
    body: `Depending on your location, you may have the right to: access your personal data;
correct inaccurate data; request deletion of your data; export your data in a portable format;
and withdraw consent at any time.

To exercise any of these rights, contact us at prathomix@gmail.com. We respond within 30 days.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your personal data for as long as your account is active. ChatBot query logs
are retained for 12 months, then anonymised. Contact form submissions are retained for 24 months.
You may request earlier deletion at any time.`,
  },
  {
    title: "8. Children's Privacy",
    body: `PRATHOMIX is not directed to children under 13 years of age. We do not knowingly
collect personal information from children. If you believe we have inadvertently collected such
information, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify registered users
by email at least 7 days before material changes take effect. Continued use of the platform
after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    body: `For privacy-related questions or requests, contact: Email: prathomix@gmail.com | Founder: founder.prathomix@gmail.com. 

Grievance Officer (Per IT Act, 2000): 
Name: Pratham Kumar Singh 
Registered Office: Garhwa, Jharkhand, India - 822114.`,
  },
]

export default function Privacy() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <SEO title="Privacy Policy" description="PRATHOMIX Privacy Policy — how we collect, use, and protect your data." />
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
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Shield size={20} className="text-brand-400" />
            </div>
            <span className="tag">Legal</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm font-mono">Last updated: June 1, 2025</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <p className="text-gray-300 text-sm leading-relaxed">
            PRATHOMIX ("we", "our", "us") is committed to protecting your privacy.
            This policy explains what information we collect, why we collect it, and how
            you can control it. We believe in transparency — if you have questions, just ask.
          </p>
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 glass rounded-2xl p-6 text-center"
        >
          <p className="text-gray-400 text-sm">
            Questions about this policy?{' '}
            <a href="mailto:prathomix@gmail.com" className="text-brand-300 hover:underline underline-offset-4 transition-colors">
              prathomix@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
