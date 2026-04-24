'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase, formatINR, CURRENT_YEAR, GRADES } from '@/lib/supabase'

const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March']
// Semantic palette — no decorative use
const GRADE_COLORS = ['#0E0E0C','#1E2A30','#2A6644','#185FA5','#8C8070','#C4501C','#A8C4CC','#C8BFB0']

export default function Finance() {
  const [monthly, setMonthly] = useState<any[]>([])
  const [byGrade, setByGrade] = useState<any[]>([])
  const [byMode, setByMode] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [projectionMonths, setProjectionMonths] = useState(3)
  const [totals, setTotals] = useState({ collected: 0, outstanding: 0, billed: 0 })
  const [feeStructure, setFeeStructure] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [paymentsRes, duesRes, feeRes] = await Promise.all([
      supabase.from('fee_payments').select('amount, payment_date, payment_mode').eq('academic_year', CURRENT_YEAR),
      supabase.from('fee_dues').select('outstanding, total_paid, total_billed, students(grade)').eq('academic_year', CURRENT_YEAR),
      supabase.from('fee_structure').select('*').eq('academic_year', CURRENT_YEAR),
    ])
    const payments = paymentsRes.data || []
    const dues = duesRes.data || []

    // Monthly
    const monthMap: Record<string, number> = {}
    payments.forEach(p => {
      const mName = new Date(p.payment_date).toLocaleString('default', { month: 'long' })
      monthMap[mName] = (monthMap[mName] || 0) + p.amount
    })
    const avgMonthly = Object.values(monthMap).reduce((a, b) => a + b, 0) / Math.max(Object.keys(monthMap).length, 1)
    setMonthly(MONTHS.map(m => ({
      month: m.substring(0, 3),
      collected: monthMap[m] || 0,
      projected: monthMap[m] ? 0 : Math.round(avgMonthly * (0.85 + Math.random() * 0.3)),
    })))

    // By grade
    setByGrade(GRADES.map(g => {
      const gd = dues.filter((d: any) => d.students?.grade === g)
      return { grade: `G${g}`, outstanding: gd.reduce((s: number, d: any) => s + (d.outstanding || 0), 0), paid: gd.reduce((s: number, d: any) => s + (d.total_paid || 0), 0) }
    }))

    // By mode
    const modeMap: Record<string, number> = {}
    payments.forEach(p => { modeMap[p.payment_mode] = (modeMap[p.payment_mode] || 0) + p.amount })
    setByMode(Object.entries(modeMap).map(([name, value]) => ({ name: name.replace('_', ' '), value })))

    setTotals({ collected: payments.reduce((s, p) => s + p.amount, 0), outstanding: dues.reduce((s: number, d: any) => s + (d.outstanding || 0), 0), billed: dues.reduce((s: number, d: any) => s + (d.total_billed || 0), 0) })
    setFeeStructure(feeRes.data || [])
    setLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bone)', border: '1px solid var(--border-heavy)', padding: '10px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: p.color, letterSpacing: '0.04em', marginBottom: 2 }}>
            {p.name}: {p.value > 1000 ? formatINR(p.value) : p.value}
          </div>
        ))}
      </div>
    )
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em' }}>Loading field data...</div>

  const annualProjection = (totals.collected / Math.max(monthly.filter((m: any) => m.collected > 0).length, 1)) * 12
  const collectionRate = totals.billed > 0 ? Math.round((totals.collected / totals.billed) * 100) : 0

  return (
    <div>
      <div className="section-header">
        <div className="section-eyebrow">05 — Financial Records</div>
        <div className="section-title">Finance</div>
        <div className="section-subtitle">Revenue analysis · Dues breakdown · Projections · {CURRENT_YEAR}</div>
      </div>

      {/* KPI strip — ink/slate background for contrast */}
      <div style={{ background: 'var(--slate)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 1 }}>
        {[
          { label: 'Collected', value: formatINR(totals.collected), unit: 'YTD · 2024–25', color: 'var(--want)' },
          { label: 'Outstanding', value: formatINR(totals.outstanding), unit: 'RECOVERY DUE', color: 'var(--summit)' },
          { label: 'Annual Projection', value: formatINR(annualProjection), unit: 'EXTRAPOLATED RATE', color: 'var(--glacier)' },
          { label: 'Collection Rate', value: `${collectionRate}%`, unit: 'vs BILLED AMOUNT', color: collectionRate >= 80 ? 'var(--want)' : 'var(--summit)' },
        ].map((k, i) => (
          <div key={k.label} style={{
            padding: '20px 22px',
            borderRight: i < 3 ? '1px solid rgba(168,196,204,0.12)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.03em', color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(168,196,204,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'rgba(168,196,204,0.4)', letterSpacing: '0.08em', marginTop: 2 }}>{k.unit}</div>
          </div>
        ))}
      </div>

      {/* Monthly collection chart */}
      <div className="card" style={{ marginBottom: 1, borderTop: '3px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 3 }}>01 — Collection Trend</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Monthly Revenue & Forecast</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)', letterSpacing: '0.06em', marginRight: 4 }}>Project:</span>
            {[1,2,3,6].map(n => (
              <button key={n} className={`btn btn-sm ${projectionMonths === n ? 'btn-ink' : 'btn-ghost'}`} onClick={() => setProjectionMonths(n)}>{n}mo</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthly} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2A6644" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2A6644" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4501C" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#C4501C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" />
            <XAxis dataKey="month" tick={{ fill: 'var(--stone)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
            <YAxis tick={{ fill: 'var(--stone)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--stone)' }} />
            <Area type="monotone" dataKey="collected" name="Collected" stroke="var(--want)" fill="url(#colGrad)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="projected" name="Projected" stroke="var(--summit)" fill="url(#projGrad)" strokeWidth={1.5} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grade dues + mode pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 1, marginBottom: 1 }}>
        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div className="coord" style={{ marginBottom: 3 }}>02 — Grade Breakdown</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20 }}>Dues by Grade</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byGrade} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={1}>
              <CartesianGrid strokeDasharray="2 4" />
              <XAxis dataKey="grade" tick={{ fill: 'var(--stone)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
              <YAxis tick={{ fill: 'var(--stone)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--stone)' }} />
              <Bar dataKey="paid" name="Paid" fill="var(--want)" radius={0} />
              <Bar dataKey="outstanding" name="Outstanding" fill="var(--summit)" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div className="coord" style={{ marginBottom: 3 }}>03 — Payment Methods</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20 }}>Mode Distribution</div>
          {byMode.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--stone)', padding: '40px 0', fontFamily: 'var(--font-body)', fontSize: 10 }}>No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byMode} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {byMode.map((_: any, i: number) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--stone)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fee structure table */}
      <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
        <div className="coord" style={{ marginBottom: 3 }}>04 — Tariff Structure</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>Fee Structure · {CURRENT_YEAR}</div>
        {feeStructure.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--stone)', padding: '24px 0', fontFamily: 'var(--font-body)', fontSize: 10 }}>No fee structure configured. Add via Supabase.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Grade</th><th>Tuition</th><th>Admission</th><th>Exam</th><th>Sports</th><th>Transport</th><th>Misc</th>
                <th style={{ color: 'var(--summit)' }}>Total Annual</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.sort((a, b) => a.grade - b.grade).map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>Grade {f.grade}</td>
                  {['tuition_fee','admission_fee','exam_fee','sports_fee','transport_fee','misc_fee'].map(k => (
                    <td key={k}><span className="coord">{formatINR(f[k] || 0)}</span></td>
                  ))}
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--summit)', letterSpacing: '0.03em' }}>
                    {formatINR(f.total_annual || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
