'use client'

import { useEffect, useState } from 'react'
import { Clock as ClockIcon } from 'lucide-react'

export function Clock() {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateDateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setDate(
        now.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      )
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div style={{
      background: 'var(--bone)',
      border: '1px solid var(--border-heavy)',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    }}>
      <ClockIcon size={16} style={{ color: 'var(--summit)' }} strokeWidth={1.5} />
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--ink)',
        letterSpacing: '0.04em',
        lineHeight: 1.4,
      }}>
        <div style={{ fontSize: '9px', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>TIME</div>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 4 }}>{time || '00:00:00'}</div>
        <div style={{ fontSize: '9px', color: 'var(--glacier)', letterSpacing: '0.05em' }}>{date || '—'}</div>
      </div>
    </div>
  )
}
