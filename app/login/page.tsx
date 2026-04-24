'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(122,153,165,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,14,12,0.06),_transparent_40%),var(--bone)] px-6 py-12">
      <div className="w-full max-w-[520px] aspect-square rounded-[2rem] border border-[var(--border-heavy)] bg-white/94 p-8 shadow-[0_0_0_1.2rem_rgba(122,153,165,0.14),0_12px_40px_rgba(14,14,12,0.06)] backdrop-blur-xl">
        <div className="h-full flex flex-col justify-between space-y-8 text-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--summit)]">SchoolOS</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Sign in to SchoolOS
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--stone)]">
              Secure access for administrators, teachers, and staff. Enter your email and password to continue.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="block text-[0.78rem] uppercase tracking-[0.16em] text-[var(--stone)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[1.5rem] border border-[var(--border-heavy)] bg-[var(--bone)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--summit)] focus:ring-2 focus:ring-[rgba(196,80,28,0.18)]"
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="password" className="block text-[0.78rem] uppercase tracking-[0.16em] text-[var(--stone)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[1.5rem] border border-[var(--border-heavy)] bg-[var(--bone)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--summit)] focus:ring-2 focus:ring-[rgba(196,80,28,0.18)]"
              />
            </div>

            {error ? (
              <div className="rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-[1.75rem] bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--bone)] transition hover:bg-[rgba(14,14,12,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--glacier)]/10 p-4 text-sm text-[var(--stone)]">
            Need help? Contact your administrator to assign a SchoolOS profile in Supabase.
          </div>
        </div>
      </div>
    </div>
  )
}
