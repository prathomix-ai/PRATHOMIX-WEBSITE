import React, { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, suffix = '', prefix = '', duration = 1.5, className = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = performance.now()
        const step = (now) => {
          const elapsed  = (now - startTime) / (duration * 1000)
          const progress = Math.min(elapsed, 1)
          const eased    = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(step)
          else setCount(end)
        }
        requestAnimationFrame(step)
        observer.unobserve(el)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref} className={className}>{prefix}{count}{suffix}</span>
}
