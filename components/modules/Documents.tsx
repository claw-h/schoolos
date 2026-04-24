'use client'

import { useEffect, useState } from 'react'
import { Search, X, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { supabase, Student, Document, DOC_TYPES, GRADES } from '@/lib/supabase'

type StudentWithDocs = Student & { documents: Document[] }

const STATUS_CONFIG: Record<string, { label: string; pill: string; icon: any }> = {
  pending:   { label: 'Pending',   pill: 'pill-ash',      icon: Clock },
  submitted: { label: 'Submitted', pill: 'pill-attempted', icon: AlertCircle },
  verified:  { label: 'Verified',  pill: 'pill-want',      icon: CheckCircle },
  rejected:  { label: 'Rejected',  pill: 'pill-alert',     icon: XCircle },
  expired:   { label: 'Expired',   pill: 'pill-alert',     icon: XCircle },
}

export default function Documents() {
  const [students, setStudents] = useState<StudentWithDocs[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<number | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDocs | null>(null)

  useEffect(() => { load() }, [gradeFilter])

  async function load() {
    setLoading(true)
    let q = supabase.from('students').select('*, documents(*)').eq('status', 'active').order('grade').order('last_name')
    if (gradeFilter) q = q.eq('grade', gradeFilter)
    const { data } = await q
    setStudents(data || [])
    setLoading(false)
  }

  const docCount = (s: StudentWithDocs) => {
    const required = DOC_TYPES.filter(d => d.value !== 'other').length
    const verified = s.documents?.filter(d => d.status === 'verified').length ?? 0
    return { verified, total: required, pct: Math.round((verified / required) * 100) }
  }

  const filtered = students.filter(s =>
    search === '' || `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalVerified = students.filter(s => { const { verified, total } = docCount(s); return verified === total }).length
  const totalPending = students.filter(s => s.documents?.some(d => d.status === 'submitted')).length

  return (
    <div>
      <div className="section-header">
        <div className="section-eyebrow">04 — Field Documents</div>
        <div className="section-title">Document Verification</div>
        <div className="section-subtitle">Manual tracking · 10 document types · Per-student checklist</div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'Fully Verified', value: totalVerified, unit: 'ALL DOCS CLEARED', color: 'var(--want)' },
          { label: 'Awaiting Review', value: totalPending, unit: 'DOCS SUBMITTED', color: 'var(--attempted)' },
          { label: 'Incomplete', value: students.length - totalVerified, unit: 'MISSING DOCUMENTS', color: 'var(--summit)' },
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

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em' }}>Loading records...</div>
      ) : selectedStudent ? (
        <DocumentDetail student={selectedStudent} onBack={() => { setSelectedStudent(null); load() }} />
      ) : (
        /* Student grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1 }}>
          {filtered.map(s => {
            const { verified, total, pct } = docCount(s)
            const pending = s.documents?.filter(d => d.status === 'submitted').length ?? 0
            return (
              <div key={s.id} className="card"
                style={{ cursor: 'pointer', borderTop: `3px solid ${pct === 100 ? 'var(--want)' : pending > 0 ? 'var(--attempted)' : 'var(--ash)'}`, transition: 'background 0.1s' }}
                onClick={() => setSelectedStudent(s)}
                onMouseEnter={e => (e.currentTarget.style.background = '#ede8df')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bone)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                    <div className="coord">{s.student_id} · Grade {s.grade}</div>
                  </div>
                  {pending > 0 && <span className="pill pill-attempted">{pending} pending</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span className="coord">{verified}/{total} verified</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: pct === 100 ? 'var(--want)' : pct >= 60 ? 'var(--attempted)' : 'var(--summit)' }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--ash)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--want)' : pct >= 60 ? 'var(--attempted)' : 'var(--summit)', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DocumentDetail({ student, onBack }: { student: StudentWithDocs; onBack: () => void }) {
  const [docs, setDocs] = useState<Document[]>(student.documents || [])
  const [saving, setSaving] = useState<string | null>(null)

  const getDoc = (type: string) => docs.find(d => d.doc_type === type)

  async function updateStatus(docType: string, status: Document['status']) {
    setSaving(docType)
    const existing = getDoc(docType)
    const now = new Date().toISOString().split('T')[0]
    if (existing) {
      await supabase.from('documents').update({ status, verified_date: status === 'verified' ? now : existing.verified_date, verified_by: status === 'verified' ? 'Admin' : existing.verified_by, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({ student_id: student.id, doc_type: docType, status, submitted_date: ['submitted','verified'].includes(status) ? now : null, verified_date: status === 'verified' ? now : null, verified_by: status === 'verified' ? 'Admin' : null })
    }
    const { data } = await supabase.from('documents').select('*').eq('student_id', student.id)
    setDocs(data || [])
    setSaving(null)
  }

  async function updateNotes(docId: string, notes: string) {
    await supabase.from('documents').update({ notes }).eq('id', docId)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {student.first_name} {student.last_name}
          </div>
          <div className="coord">Grade {student.grade} · {student.student_id}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
        {DOC_TYPES.map(dt => {
          const doc = getDoc(dt.value)
          const status = doc?.status ?? 'pending'
          const { pill, icon: Icon } = STATUS_CONFIG[status]
          return (
            <div key={dt.value} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500 }}>{dt.label}</span>
                <span className={`pill ${pill}`}><Icon size={9} />{STATUS_CONFIG[status].label}</span>
              </div>
              {doc?.submitted_date && (
                <div className="coord" style={{ marginBottom: 8 }}>
                  Submitted: {doc.submitted_date}{doc.verified_date ? ` · Verified: ${doc.verified_date}` : ''}
                </div>
              )}
              {doc && (
                <textarea className="field" rows={1} placeholder="Notes..." defaultValue={doc.notes ?? ''}
                  onBlur={e => updateNotes(doc.id, e.target.value)}
                  style={{ fontSize: 11, marginBottom: 10, resize: 'none' }} />
              )}
              <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(['pending','submitted','verified','rejected'] as Document['status'][]).map(s => (
                  <button key={s}
                    className={`btn btn-sm ${status === s ? (s === 'verified' ? 'btn-ink' : s === 'rejected' ? 'btn-primary' : 'btn-ink') : 'btn-ghost'}`}
                    style={{ fontSize: 9, opacity: saving === dt.value ? 0.5 : 1 }}
                    onClick={() => updateStatus(dt.value, s)}
                    disabled={saving === dt.value}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
