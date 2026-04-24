'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, Student, Subject, AcademicRecord, GRADES, CURRENT_YEAR, EXAM_TYPES, gradeToLetter } from '@/lib/supabase'

export default function Academics() {
  const [gradeFilter, setGradeFilter] = useState(1)
  const [examType, setExamType] = useState('mid_term')
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [gradeFilter, examType])

  async function load() {
    setLoading(true)
    const [sRes, subRes, rRes] = await Promise.all([
      supabase.from('students').select('*').eq('grade', gradeFilter).eq('status', 'active').order('roll_number'),
      supabase.from('subjects').select('*').eq('grade', gradeFilter),
      supabase.from('academic_records').select('*, subjects(*)').eq('academic_year', CURRENT_YEAR).eq('exam_type', examType),
    ])
    setStudents(sRes.data || [])
    setSubjects(subRes.data || [])
    setRecords(rRes.data || [])
    setLoading(false)
  }

  const getRecord = (sid: string, subid: string) => records.find(r => r.student_id === sid && r.subject_id === subid)

  const getAvg = (sid: string) => {
    const recs = records.filter(r => r.student_id === sid && r.marks_obtained !== null)
    if (!recs.length) return null
    return (recs.reduce((s, r) => s + (r.marks_obtained! / r.max_marks) * 100, 0) / recs.length).toFixed(1)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">03 — Academic Records</div>
          <div className="section-title">Academics</div>
          <div className="section-subtitle">Mark entry · Performance tracking · Report cards</div>
        </div>
        <button className="btn btn-ink" onClick={() => { setSelectedStudent(null); setShowModal(true) }}>
          <Plus size={12} strokeWidth={2} /> Enter Marks
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 1, alignItems: 'flex-end' }}>
        <div>
          <label className="field-label">Grade</label>
          <select className="field" style={{ width: 120 }} value={gradeFilter} onChange={e => setGradeFilter(+e.target.value)}>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Examination</label>
          <select className="field" style={{ width: 180 }} value={examType} onChange={e => setExamType(e.target.value)}>
            {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div style={{ paddingBottom: 8 }}>
          <span className="coord">{students.length} students · {subjects.length} subjects</span>
        </div>
      </div>

      {/* Marks grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em' }}>Loading records...</div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--stone)' }}>No Students in Grade {gradeFilter}</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', borderTop: '3px solid var(--ink)' }}>
          <table className="tbl" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Student</th>
                {subjects.map(sub => <th key={sub.id} style={{ textAlign: 'center', minWidth: 80 }}>{sub.name}</th>)}
                <th style={{ textAlign: 'center' }}>Avg %</th>
                <th style={{ textAlign: 'center' }}>Grade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const avg = getAvg(s.id)
                const avgNum = avg ? parseFloat(avg) : null
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</div>
                      <div className="coord">Roll {s.roll_number ?? '?'}</div>
                    </td>
                    {subjects.map(sub => {
                      const rec = getRecord(s.id, sub.id)
                      const pct = rec?.marks_obtained != null ? (rec.marks_obtained / rec.max_marks) * 100 : null
                      return (
                        <td key={sub.id} style={{ textAlign: 'center' }}>
                          {rec?.marks_obtained != null ? (
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                              color: pct! >= 75 ? 'var(--want)' : pct! >= 50 ? '#b8860b' : 'var(--summit)',
                            }}>{rec.marks_obtained}</span>
                          ) : <span style={{ color: 'var(--ash)' }}>—</span>}
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>{avg ? `${avg}%` : '—'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {avgNum != null ? (
                        <span className={`pill ${avgNum >= 75 ? 'pill-want' : avgNum >= 50 ? 'pill-attempted' : 'pill-alert'}`}>
                          {gradeToLetter(avgNum)}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedStudent(s); setShowModal(true) }}>Enter</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <MarksModal student={selectedStudent} students={students} subjects={subjects} examType={examType} records={records} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function MarksModal({ student, students, subjects, examType, records, onClose, onSave }: any) {
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id ?? '')
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!selectedStudentId) return
    const existing: Record<string, string> = {}
    subjects.forEach((sub: Subject) => {
      const rec = records.find((r: AcademicRecord) => r.student_id === selectedStudentId && r.subject_id === sub.id)
      if (rec?.marks_obtained != null) existing[sub.id] = String(rec.marks_obtained)
    })
    setMarks(existing)
  }, [selectedStudentId])

  async function handleSave() {
    if (!selectedStudentId) return
    setSaving(true)
    for (const [subjectId, marksVal] of Object.entries(marks).filter(([, v]) => v !== '')) {
      const sub = subjects.find((s: Subject) => s.id === subjectId)
      const mo = parseFloat(marksVal)
      await supabase.from('academic_records').upsert({
        student_id: selectedStudentId, subject_id: subjectId, academic_year: CURRENT_YEAR, exam_type: examType,
        marks_obtained: mo, max_marks: sub?.max_marks ?? 100, grade_letter: gradeToLetter((mo / (sub?.max_marks ?? 100)) * 100),
        exam_date: examDate, recorded_by: 'Admin',
      }, { onConflict: 'student_id,subject_id,academic_year,exam_type' })
    }
    setSaving(false); onSave()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>03 — Mark Entry · {EXAM_TYPES.find(e => e.value === examType)?.label}</div>
            <h2 className="modal-title" style={{ margin: 0 }}>Enter Marks</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Student</label>
            <select className="field" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
              <option value="">Select student...</option>
              {students.map((s: Student) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — Roll {s.roll_number}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Exam Date</label>
            <input className="field" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <span className="pill pill-attempted">{EXAM_TYPES.find(e => e.value === examType)?.label}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {subjects.map((sub: Subject) => (
            <div key={sub.id}>
              <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{sub.name}</span><span style={{ color: 'var(--ash)' }}>/{sub.max_marks}</span>
              </label>
              <input className="field" type="number" min={0} max={sub.max_marks} value={marks[sub.id] ?? ''}
                onChange={e => setMarks(m => ({ ...m, [sub.id]: e.target.value }))} placeholder="—" />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={handleSave} disabled={saving || !selectedStudentId}>
            {saving ? 'Recording...' : 'Save Marks'}
          </button>
        </div>
      </div>
    </div>
  )
}
