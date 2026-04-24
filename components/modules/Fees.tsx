'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { supabase, Student, FeePayment, formatINR, GRADES, CURRENT_YEAR } from '@/lib/supabase'

type StudentWithDues = Student & { fee_dues?: any[] }

export default function Fees() {
  const [students, setStudents] = useState<StudentWithDues[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<number | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null)

  useEffect(() => { load() }, [gradeFilter])

  async function load() {
    setLoading(true)
    let q = supabase.from('students').select('*, fee_dues(*)').eq('status', 'active').order('grade').order('roll_number')
    if (gradeFilter) q = q.eq('grade', gradeFilter)
    const { data } = await q
    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter(s =>
    search === '' || `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase())
  )

  const defaulters = filtered.filter(s => {
    const due = s.fee_dues?.find((d: any) => d.academic_year === CURRENT_YEAR)
    return (due?.outstanding ?? 0) > 0
  })

  const totalOutstanding = filtered.reduce((sum, s) => {
    const due = s.fee_dues?.find((d: any) => d.academic_year === CURRENT_YEAR)
    return sum + (due?.outstanding ?? 0)
  }, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">02 — Ledger</div>
          <div className="section-title">Fee Management</div>
          <div className="section-subtitle">{defaulters.length} defaulters · {formatINR(totalOutstanding)} outstanding</div>
        </div>
        <button className="btn btn-ink" onClick={() => { setSelectedStudent(null); setShowPaymentModal(true) }}>
          <Plus size={12} strokeWidth={2} /> Record Payment
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'Defaulters', value: defaulters.length, unit: 'STUDENTS WITH DUES', color: 'var(--summit)' },
          { label: 'Outstanding', value: formatINR(totalOutstanding), unit: 'TOTAL RECOVERY DUE', color: 'var(--summit)' },
          { label: 'Cleared', value: filtered.length - defaulters.length, unit: 'FULLY PAID STUDENTS', color: 'var(--want)' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-value" style={{ fontSize: 32, color: k.color }}>{k.value}</div>
            <div className="stat-label">{k.label}</div>
            <div className="stat-unit">{k.unit}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
        <div style={{ position: 'relative', flex: 2 }}>
          <Search size={11} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--stone)' }} />
          <input className="field" style={{ paddingLeft: 30 }} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="field" style={{ flex: 1 }} value={gradeFilter ?? ''} onChange={e => setGradeFilter(e.target.value ? +e.target.value : null)}>
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em' }}>
            Loading ledger...
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th><th>Grade</th><th>Billed</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const due = s.fee_dues?.find((d: any) => d.academic_year === CURRENT_YEAR)
                const outstanding = due?.outstanding ?? 0
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</div>
                      <div className="coord">{s.student_id}</div>
                    </td>
                    <td><span className="coord">Gr.{s.grade}</span></td>
                    <td><span className="coord">{formatINR(due?.total_billed ?? 0)}</span></td>
                    <td style={{ color: 'var(--want)', fontWeight: 500 }}>{formatINR(due?.total_paid ?? 0)}</td>
                    <td style={{ color: outstanding > 0 ? 'var(--summit)' : 'var(--want)', fontWeight: 600 }}>
                      {formatINR(outstanding)}
                    </td>
                    <td>
                      <span className={`pill ${outstanding <= 0 ? 'pill-want' : 'pill-alert'}`}>
                        {outstanding <= 0 ? 'Cleared' : 'Due'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 1 }}>
                        <button className="btn btn-ink btn-sm" onClick={() => { setSelectedStudent(s); setShowPaymentModal(true) }}>Pay</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setHistoryStudent(s); setShowHistoryModal(true) }}>History</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showPaymentModal && <PaymentModal student={selectedStudent} students={students} onClose={() => setShowPaymentModal(false)} onSave={() => { setShowPaymentModal(false); load() }} />}
      {showHistoryModal && historyStudent && <HistoryModal student={historyStudent} onClose={() => setShowHistoryModal(false)} />}
    </div>
  )
}

function PaymentModal({ student, students, onClose, onSave }: any) {
  const [form, setForm] = useState({ student_id: student?.id ?? '', payment_type: 'tuition', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_mode: 'cash', month: '', receipt_number: '', remarks: '', recorded_by: 'Admin' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.student_id || !form.amount) { setError('Student and amount required.'); return }
    setSaving(true); setError('')
    try {
      const amount = parseFloat(form.amount)
      await supabase.from('fee_payments').insert({ student_id: form.student_id, academic_year: CURRENT_YEAR, payment_type: form.payment_type, amount, payment_date: form.payment_date, payment_mode: form.payment_mode, month: form.month || null, receipt_number: form.receipt_number || null, remarks: form.remarks || null, recorded_by: form.recorded_by })
      const { data: existing } = await supabase.from('fee_dues').select('*').eq('student_id', form.student_id).eq('academic_year', CURRENT_YEAR).single()
      if (existing) { await supabase.from('fee_dues').update({ total_paid: existing.total_paid + amount, last_payment_date: form.payment_date, updated_at: new Date().toISOString() }).eq('id', existing.id) }
      else { await supabase.from('fee_dues').insert({ student_id: form.student_id, academic_year: CURRENT_YEAR, total_billed: 0, total_paid: amount, last_payment_date: form.payment_date }) }
      onSave()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const L = ({ label, children }: any) => <div><label className="field-label">{label}</label>{children}</div>

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>02 — Ledger Entry</div>
            <h2 className="modal-title" style={{ margin: 0 }}>Record Payment</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer', marginTop: 4 }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}><L label="Student *"><select className="field" value={form.student_id} onChange={e => set('student_id', e.target.value)}><option value="">Select student...</option>{students.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — Grade {s.grade}</option>)}</select></L></div>
          <L label="Payment Type"><select className="field" value={form.payment_type} onChange={e => set('payment_type', e.target.value)}><option value="tuition">Tuition</option><option value="admission">Admission</option><option value="exam">Exam</option><option value="sports">Sports</option><option value="transport">Transport</option><option value="misc">Miscellaneous</option><option value="full">Full Payment</option></select></L>
          <L label="Amount (₹) *"><input className="field" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" /></L>
          <L label="Payment Date"><input className="field" type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} /></L>
          <L label="Mode"><select className="field" value={form.payment_mode} onChange={e => set('payment_mode', e.target.value)}><option value="cash">Cash</option><option value="upi">UPI</option><option value="online">Online</option><option value="cheque">Cheque</option><option value="bank_transfer">Bank Transfer</option></select></L>
          <L label="Month (if monthly)"><select className="field" value={form.month} onChange={e => set('month', e.target.value)}><option value="">— Annual / One-time</option>{['April','May','June','July','August','September','October','November','December','January','February','March'].map(m => <option key={m}>{m}</option>)}</select></L>
          <L label="Receipt No."><input className="field" value={form.receipt_number} onChange={e => set('receipt_number', e.target.value)} /></L>
          <L label="Recorded By"><input className="field" value={form.recorded_by} onChange={e => set('recorded_by', e.target.value)} /></L>
          <div style={{ gridColumn: '1/-1' }}><L label="Remarks"><input className="field" value={form.remarks} onChange={e => set('remarks', e.target.value)} /></L></div>
        </div>
        {error && <div style={{ color: 'var(--summit)', fontSize: 11, fontFamily: 'var(--font-body)', marginTop: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 1, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={handleSave} disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</button>
        </div>
      </div>
    </div>
  )
}

function HistoryModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('fee_payments').select('*').eq('student_id', student.id).order('payment_date', { ascending: false }).then(({ data }) => { setPayments(data || []); setLoading(false) })
  }, [student.id])

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in" style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>02 — Payment History</div>
            <h2 className="modal-title" style={{ margin: 0 }}>{student.first_name} {student.last_name}</h2>
            <div className="coord">Grade {student.grade} · {student.student_id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10 }}>Loading...</div> :
          payments.length === 0 ? <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--font-body)', color: 'var(--stone)' }}>No payments recorded</div> : (
          <>
            <table className="tbl">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Mode</th><th>Receipt</th><th>Month</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="coord">{p.payment_date}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_type.replace('_', ' ')}</td>
                    <td style={{ color: 'var(--want)', fontWeight: 600 }}>{formatINR(p.amount)}</td>
                    <td style={{ textTransform: 'capitalize' }}><span className="coord">{p.payment_mode}</span></td>
                    <td><span className="coord">{p.receipt_number ?? '—'}</span></td>
                    <td>{p.month ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
              <span className="coord">Total Paid:</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--want)', letterSpacing: '0.04em' }}>
                {formatINR(payments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
