import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Github, Twitter, Linkedin, Instagram } from 'lucide-react'

const LINKS = {
  Platform: [
    { to: '/services',     label: 'Services'      },
    { to: '/products',     label: 'Products'      },
    // { to: '/pricing',      label: 'Pricing'       },
    { to: '/case-studies', label: 'Case Studies'  },
  ],
  Company: [
    { to: '/about',  label: 'About'     },
    { to: '/founder', label: 'Founder'   },
    { to: '/blog',    label: 'Blog'      },
    { to: '/contact', label: 'Contact'   },
    { to: '/login',   label: 'Sign In'   },
  ],
  Legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms',   label: 'Terms of Use'   },
  ],
}

const SOCIALS = [
  { icon: Github,   href: 'https://github.com/prathomix',            label: 'GitHub'   },
  { icon: Instagram, href: 'https://www.instagram.com/prathomix',    label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/prathomix',  label: 'LinkedIn' },
  { icon: Twitter,  href: 'https://twitter.com/prathomix',           label: 'Twitter'  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/5 mt-24 bg-gray-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">

          {/* Brand col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="PRATHOMIX logo"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="font-display font-bold text-lg tracking-tight">PRATHOMIX</span>
            </div>
            <p className="text-sm text-gray-400 font-body leading-relaxed max-w-xs">
              PRATHOMIX is a generative intelligence engine designed to solve real-world problems.
              We build helpful AI tools and take custom orders to create exactly the software your
              business needs to grow faster and save money.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                   aria-label={label}
                   className="p-2 rounded-lg text-gray-500 hover:text-brand-300 hover:bg-brand-500/10 transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-4">{section}</p>
              <ul className="space-y-2.5">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-mono">
            &copy; {year} PRATHOMIX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:prathomix@gmail.com" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors font-mono">
              <Mail size={12} /> prathomix@gmail.com
            </a>
            <a href="https://wa.me/919887754009" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors font-mono">
              <MessageCircle size={12} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
