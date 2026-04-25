'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital@1&display=swap');

        :root {
          --bone: #F2EDE4;
          --ink: #0E0E0C;
          --summit: #C4501C;
          --slate: #1E2A30;
          --glacier: #A8C4CC;
          --stone: #8C8070;
          --ash: #C8BFB0;
          --border: rgba(14,14,12,0.12);
          --border-heavy: rgba(14,14,12,0.30);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lekh-root {
          min-height: 100vh;
          background-color: var(--bone);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          cursor: crosshair;
          font-family: 'IBM Plex Mono', monospace;
          position: relative;
        }

        /* Full-page ruled substrate */
        .lekh-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 27px,
            rgba(14,14,12,0.06) 27px,
            rgba(14,14,12,0.06) 28px
          );
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          border: 1.5px solid var(--border-heavy);
          background-color: var(--bone);
          display: flex;
          flex-direction: column;
        }

        /* Margin line — vertical Summit orange anchor */
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 13%;
          width: 1.5px;
          background-color: var(--summit);
          opacity: 0.7;
          pointer-events: none;
          z-index: 2;
        }

        /* ── HEADER BAR ── */
        .card-header {
          border-bottom: 1.5px solid var(--border-heavy);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--stone);
          white-space: nowrap;
        }

        .header-section-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: var(--summit);
          text-transform: uppercase;
          border-right: 1px solid var(--border-heavy);
          padding-right: 0.75rem;
          margin-right: 0.25rem;
        }

        /* ── TITLE BLOCK ── */
        .card-title-block {
          padding: 2rem 1.25rem 1.5rem 1.25rem;
          border-bottom: 1px dashed var(--border);
        }

        .card-display-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          letter-spacing: 0.08em;
          color: var(--ink);
          line-height: 1;
          text-transform: uppercase;
        }

        .card-display-title span {
          color: var(--summit);
        }

        .card-editorial {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.8rem;
          color: var(--stone);
          margin-top: 0.5rem;
          letter-spacing: 0.01em;
        }

        /* ── FORM BODY ── */
        .card-form {
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .field-row {
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .field-row:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .field-label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--stone);
          margin-bottom: 0.5rem;
        }

        .field-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid var(--border-heavy);
          padding: 0.4rem 0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.85rem;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s;
          letter-spacing: 0.02em;
          border-radius: 0;
        }

        .field-input::placeholder {
          color: var(--ash);
        }

        .field-input:focus {
          border-bottom-color: var(--summit);
        }

        /* ── ERROR ── */
        .error-row {
          border: 1px solid rgba(196,80,28,0.35);
          background: rgba(196,80,28,0.06);
          padding: 0.6rem 0.75rem;
          margin-bottom: 1.25rem;
        }

        .error-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          color: var(--summit);
          letter-spacing: 0.02em;
        }

        /* ── CTA ── */
        .cta-block {
          border-top: 1.5px solid var(--border-heavy);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .cta-hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          color: var(--stone);
          letter-spacing: 0.08em;
          line-height: 1.5;
          max-width: 55%;
        }

        .cta-btn {
          flex-shrink: 0;
          background-color: var(--ink);
          color: var(--bone);
          border: none;
          padding: 0.65rem 1.5rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: crosshair;
          transition: background-color 0.15s, opacity 0.15s;
          border-radius: 0;
        }

        .cta-btn:hover:not(:disabled) {
          background-color: var(--slate);
        }

        .cta-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ── FOOTER / COORD STAMP ── */
        .card-footer {
          border-top: 1px dashed var(--border);
          padding: 0.6rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .coord-stamp {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          color: var(--ash);
          text-transform: uppercase;
        }

        .version-stamp {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          color: var(--ash);
          text-transform: uppercase;
        }
      `}</style>

      <div className="lekh-root">
        <div className="login-card">

          {/* Header */}
          <div className="card-header">
            <span className="header-section-num">00 —</span>
            <span className="header-eyebrow">SchoolOS · Access Control</span>
          </div>

          {/* Title block */}
          <div className="card-title-block">
            <div className="card-display-title">
              SIGN <span>IN</span>
            </div>
            <div className="card-editorial">
              secure access for administrators, teachers &amp; staff
            </div>
          </div>

          {/* Form */}
          <form className="card-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <label htmlFor="email" className="field-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="field-row" style={{ marginTop: '1.25rem' }}>
              <label htmlFor="password" className="field-label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="············"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
            </div>

            {error ? (
              <div className="error-row" style={{ marginTop: '1.25rem' }}>
                <span className="error-text">⚠ {error}</span>
              </div>
            ) : null}

            <div className="cta-block">
              <p className="cta-hint">
                Contact your administrator to get a SchoolOS profile assigned.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="cta-btn"
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="card-footer">
            <span className="coord-stamp">28°57′N · 77°01′E · Sonīpat</span>
            <span className="version-stamp">v01 · 2026</span>
          </div>

        </div>
      </div>
    </>
  )
}