'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, HealthRecord, Student } from '@/lib/supabase'

export default function Health() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [rRes, sRes] = await Promise.all([
      supabase.from('health_records').select('*, students(first_name,last_name,grade)').order('recorded_at', { ascending: false }),
      supabase.from('students').select('id,first_name,last_name,grade').eq('status', 'active').order('grade').order('last_name'),
    ])
    setRecords(rRes.data || [])
    setStudents((sRes.data as any) || [])
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">10 — Wellness</div>
          <div className="section-title">Health Records</div>
          <div className="section-subtitle">Medical notes · follow-up plans · student care</div>
        </div>
        <button className="btn btn-ink" onClick={() => setShowModal(true)}>
          <Plus size={12} strokeWidth={2} /> Add Record
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'Records', value: records.length },
          { label: 'Active Students', value: students.length },
          { label: 'Recent Notes', value: Math.min(records.length, 5) },
        ].map(box => (
          <div key={box.label} className="stat-card">
            <div className="stat-value" style={{ fontSize: 30 }}>{box.value}</div>
            <div className="stat-label">{box.label}</div>
            <div className="stat-unit">Items</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)' }}>Loading health records...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Date</th>
                <th>Condition</th>
                <th>Follow Up</th>
                <th>Doctor</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.students ? `${record.students.first_name} ${record.students.last_name}` : '—'}</td>
                  <td>{record.recorded_at}</td>
                  <td>{record.condition || 'General'}</td>
                  <td>{record.follow_up || '—'}</td>
                  <td>{record.caregiver || 'School Nurse'}</td>
                  <td>{record.notes ? record.notes.substring(0, 40) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <HealthModal students={students} onClose={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function HealthModal({ students, onClose }: { students: Student[]; onClose: () => void }) {
  const [form, setForm] = useState({ student_id: '', condition: '', notes: '', recorded_at: new Date().toISOString().split('T')[0], follow_up: '', caregiver: '' })
  const [saving, setSaving] = useState(false)
  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function save() {
    if (!form.student_id || !form.notes) return
    setSaving(true)
    await supabase.from('health_records').insert({
      student_id: form.student_id,
      condition: form.condition || null,
      notes: form.notes,
      recorded_at: form.recorded_at,
      follow_up: form.follow_up || null,
      caregiver: form.caregiver || null,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>Record a student wellness note</div>
            <h2 className="modal-title">Add Health Record</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Student</label>
            <select className="field" value={form.student_id} onChange={e => set('student_id', e.target.value)}>
              <option value="">Select student...</option>
              {students.map(student => <option key={student.id} value={student.id}>{student.first_name} {student.last_name} — Grade {student.grade}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Record Date</label>
            <input className="field" type="date" value={form.recorded_at} onChange={e => set('recorded_at', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Condition</label>
            <input className="field" value={form.condition} onChange={e => set('condition', e.target.value)} placeholder="Fever, follow-up, etc." />
          </div>
          <div>
            <label className="field-label">Caregiver</label>
            <input className="field" value={form.caregiver} onChange={e => set('caregiver', e.target.value)} placeholder="Nurse / Doctor" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Follow-up Action</label>
            <input className="field" value={form.follow_up} onChange={e => set('follow_up', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
