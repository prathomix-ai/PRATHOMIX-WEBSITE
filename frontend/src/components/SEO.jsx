import { useEffect } from 'react'

const BASE = 'PRATHOMIX'
const DEFAULT_DESC = 'Intelligence Meets Execution. AI-powered SaaS solutions for modern businesses.'

export default function SEO({ title, description = DEFAULT_DESC, image }) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Intelligence Meets Execution`

    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.querySelector(sel)
      if (!el) {
        el = document.createElement('meta')
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('og:title',       title ? `${title} — ${BASE}` : BASE, true)
    setMeta('og:description', description, true)
    setMeta('og:type',        'website',   true)
    if (image) setMeta('og:image', image, true)
    setMeta('twitter:card',        'summary_large_image')
    setMeta('twitter:title',       title ? `${title} — ${BASE}` : BASE)
    setMeta('twitter:description', description)
  }, [title, description, image])

  return null
}
