'use client'

import { useEffect, useState } from 'react'
import { Users, IndianRupee, TrendingUp, AlertTriangle, BookOpen, FileCheck, ArrowUpRight, BookOpenCheck } from 'lucide-react'
import { supabase, formatINR, CURRENT_YEAR } from '@/lib/supabase'
import { Clock } from '@/components/ui/Clock'
import { WeatherWidget } from '@/components/ui/WeatherWidget'
import { getCurrentAcademicYear, isAcademicYearStarting } from '@/lib/academic-year'

type Props = { onNavigate: (m: any) => void }

export default function Dashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const [studentsRes, paymentsRes, duesRes, docsRes] = await Promise.all([
        supabase.from('students').select('id, grade, status'),
        supabase.from('fee_payments').select('amount, payment_date, student_id, students(first_name, last_name, grade)').eq('academic_year', CURRENT_YEAR).order('payment_date', { ascending: false }).limit(6),
        supabase.from('fee_dues').select('outstanding').eq('academic_year', CURRENT_YEAR),
        supabase.from('documents').select('status').eq('status', 'pending'),
      ])
      const students = studentsRes.data || []
      setStats({
        totalStudents: students.length,
        activeStudents: students.filter((s: any) => s.status === 'active').length,
        totalCollected: (paymentsRes.data || []).reduce((s: number, p: any) => s + p.amount, 0),
        totalOutstanding: (duesRes.data || []).reduce((s: number, d: any) => s + (d.outstanding || 0), 0),
        pendingDocs: docsRes.data?.length || 0,
        gradeDistribution: [1,2,3,4,5,6,7,8].map(g => ({ grade: g, count: students.filter((s: any) => s.grade === g).length })),
        recentPayments: paymentsRes.data || [],
      })
    } finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading field data...
    </div>
  )

  const kpis = [
    { num: '01', label: 'Total Students', unit: 'ENROLLED · ACTIVE', value: stats.totalStudents, sub: `${stats.activeStudents} active`, color: 'var(--ink)', go: 'students' },
    { num: '02', label: 'Fees Collected', unit: `${CURRENT_YEAR} · YTD`, value: formatINR(stats.totalCollected), sub: 'recorded payments', color: 'var(--want)', go: 'fees' },
    { num: '03', label: 'Outstanding Dues', unit: 'ACROSS ALL GRADES', value: formatINR(stats.totalOutstanding), sub: 'pending recovery', color: 'var(--summit)', go: 'fees' },
    { num: '04', label: 'Pending Docs', unit: 'NEED VERIFICATION', value: stats.pendingDocs, sub: 'documents submitted', color: 'var(--attempted)', go: 'documents' },
  ]

  return (
    <div>
      {/* Section header with clock + weather */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="section-eyebrow">00 — Overview</div>
          <div className="section-title">School at a Glance</div>
          <div className="section-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            &nbsp;·&nbsp;ACADEMIC YEAR {getCurrentAcademicYear().toUpperCase().replace('-', '–')}
            {isAcademicYearStarting() && <span style={{ color: 'var(--summit)', marginLeft: 12 }}>⚠️ New Academic Year Starting</span>}
          </div>
        </div>
        {/* Clock + Weather Grid — equal width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Clock />
          <WeatherWidget />
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 1 }}>
        {kpis.map(k => (
          <div key={k.num}
            className="stat-card"
            style={{ cursor: 'pointer', transition: 'background 0.1s' }}
            onClick={() => onNavigate(k.go)}
            onMouseEnter={e => (e.currentTarget.style.background = '#ede8df')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bone)')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--ash)', letterSpacing: '0.1em' }}>{k.num} —</span>
              <ArrowUpRight size={12} color="var(--ash)" />
            </div>
            <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
            <div className="stat-label">{k.label}</div>
            <div className="stat-unit">{k.unit}</div>
          </div>
        ))}
      </div>

      {/* Divider rule */}
      <div style={{ height: 1, background: 'var(--border-heavy)', margin: '24px 0' }} />

      {/* Lower grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 1 }}>
        {/* Grade distribution */}
        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>01 — Distribution</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Students by Grade</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('students')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.gradeDistribution.map((g: any) => {
              const pct = stats.totalStudents > 0 ? (g.count / stats.totalStudents) * 100 : 0
              return (
                <div key={g.grade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--stone)', letterSpacing: '0.04em' }}>Grade {g.grade}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500 }}>{g.count}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--ash)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct > 0 ? 'var(--ink)' : 'transparent', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent payments */}
        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>02 — Ledger</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recent Payments</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('fees')}>Full Ledger</button>
          </div>
          {stats.recentPayments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--stone)', padding: '24px 0', fontFamily: 'var(--font-body)', fontSize: 11 }}>No payments recorded</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {stats.recentPayments.map((p: any, i: number) => {
                const s = p.students as any
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px dashed var(--border)', opacity: i > 3 ? 0.6 : 1 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500 }}>{s ? `${s.first_name} ${s.last_name}` : '—'}</div>
                      <div className="coord">{s ? `Grade ${s.grade}` : ''} · {p.payment_date}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--want)', letterSpacing: '0.04em' }}>{formatINR(p.amount)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions — marquee-style band */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 1 }}>
          {[
            { label: 'Add Student', go: 'students', icon: Users },
            { label: 'Record Payment', go: 'fees', icon: IndianRupee },
            { label: 'Enter Marks', go: 'academics', icon: BookOpen },
            { label: 'Admissions', go: 'admissions', icon: BookOpenCheck },
            { label: 'Staff Profiles', go: 'staff', icon: Users },
            { label: 'Library', go: 'library', icon: FileCheck },
          ].map(a => {
            const Icon = a.icon
            return (
              <button key={a.go} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', borderRight: 'none' }} onClick={() => onNavigate(a.go)}>
                <Icon size={11} strokeWidth={1.5} />
                {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
