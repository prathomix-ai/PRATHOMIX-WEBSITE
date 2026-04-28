/**
 * TypeWriter — cycles through an array of strings with a
 * blinking cursor, typing and erasing each one.
 *
 * Usage:
 *   <TypeWriter
 *     strings={['Build AI products.', 'Automate workflows.', 'Scale faster.']}
 *     speed={60}
 *     deleteSpeed={30}
 *     pauseMs={1800}
 *     className="text-gradient"
 *   />
 */
import React, { useEffect, useState, useRef } from 'react'

export default function TypeWriter({
  strings = [],
  speed = 65,
  deleteSpeed = 35,
  pauseMs = 2000,
  className = '',
  cursorChar = '|',
}) {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase]         = useState('typing')   // typing | pause | deleting
  const [idx, setIdx]             = useState(0)
  const [cursorOn, setCursorOn]   = useState(true)
  const timeoutRef = useRef(null)

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Typing machine
  useEffect(() => {
    if (!strings.length) return
    const current = strings[idx % strings.length]

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          speed
        )
      } else {
        timeoutRef.current = setTimeout(() => setPhase('pause'), pauseMs)
      }
    } else if (phase === 'pause') {
      setPhase('deleting')
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deleteSpeed
        )
      } else {
        setIdx(i => i + 1)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeoutRef.current)
  }, [displayed, phase, idx, strings, speed, deleteSpeed, pauseMs])

  return (
    <span className={className}>
      {displayed}
      <span
        style={{ opacity: cursorOn ? 1 : 0, transition: 'opacity 0.1s' }}
        className="ml-0.5 font-light"
      >
        {cursorChar}
      </span>
    </span>
  )
}
