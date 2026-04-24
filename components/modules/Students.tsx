'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { supabase, Student, StudentProfile, GRADES } from '@/lib/supabase'

const STATUS_PILL: Record<string, string> = {
  active: 'pill-want',
  inactive: 'pill-ash',
  transferred: 'pill-attempted',
  graduated: 'pill-summit',
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selected, setSelected] = useState<Student | null>(null)
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null)

  useEffect(() => { load() }, [gradeFilter, statusFilter])

  async function load() {
    setLoading(true)
    let q = supabase.from('students').select('*').order('grade').order('roll_number')
    if (gradeFilter) q = q.eq('grade', gradeFilter)
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter(s =>
    search === '' || `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">01 — Registry</div>
          <div className="section-title">Students</div>
          <div className="section-subtitle">{filtered.length} records · Grades 1–8</div>
        </div>
        <button className="btn btn-ink" onClick={() => { setSelected(null); setShowModal(true) }}>
          <Plus size={12} strokeWidth={2} /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
        <div style={{ position: 'relative', flex: 2 }}>
          <Search size={11} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--stone)' }} />
          <input className="field" style={{ paddingLeft: 30 }} placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="field" style={{ flex: 1 }} value={gradeFilter ?? ''} onChange={e => setGradeFilter(e.target.value ? +e.target.value : null)}>
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select className="field" style={{ flex: 1 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="transferred">Transferred</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--stone)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Retrieving field records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 12 }}>No Records Found</div>
            <button className="btn btn-ink btn-sm" onClick={() => { setSelected(null); setShowModal(true) }}>Add First Student</button>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade · Section</th>
                <th>Roll</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="coord">{s.student_id}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, background: 'var(--ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--bone)', letterSpacing: '0.04em',
                      }}>{s.first_name[0]}{s.last_name[0]}</div>
                      <span style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td><span className="coord">Gr.{s.grade} · {s.section}</span></td>
                  <td>{s.roll_number ?? '—'}</td>
                  <td style={{ color: 'var(--stone)' }}>{s.guardian_name ?? '—'}</td>
                  <td><span className="coord">{s.guardian_phone ?? '—'}</span></td>
                  <td><span className={`pill ${STATUS_PILL[s.status]}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedProfileStudent(s); setShowProfileModal(true) }}>Profile</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(s); setShowModal(true) }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showProfileModal && selectedProfileStudent && <ProfileModal student={selectedProfileStudent} onClose={() => { setShowProfileModal(false); setSelectedProfileStudent(null); load() }} />}
      {showModal && <StudentModal student={selected} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function StudentModal({ student, onClose, onSave }: { student: Student | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!student
  const [form, setForm] = useState({
    student_id: student?.student_id ?? '',
    first_name: student?.first_name ?? '',
    last_name: student?.last_name ?? '',
    date_of_birth: student?.date_of_birth ?? '',
    gender: student?.gender ?? 'Male',
    grade: student?.grade ?? 1,
    section: student?.section ?? 'A',
    roll_number: student?.roll_number ?? '',
    guardian_name: student?.guardian_name ?? '',
    guardian_phone: student?.guardian_phone ?? '',
    guardian_email: student?.guardian_email ?? '',
    address: student?.address ?? '',
    status: student?.status ?? 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.student_id || !form.first_name || !form.last_name) { setError('ID, first name and last name required.'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, roll_number: form.roll_number || null, grade: +form.grade }
      if (isEdit && student) { await supabase.from('students').update(payload).eq('id', student.id) }
      else { await supabase.from('students').insert(payload) }
      onSave()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!student || !confirm(`Delete ${student.first_name}? Permanent.`)) return
    await supabase.from('students').delete().eq('id', student.id)
    onSave()
  }

  const LabeledField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="field-label">{label}</label>{children}</div>
  )

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              {isEdit ? '01 — Edit Record' : '01 — New Record'}
            </div>
            <h2 className="modal-title" style={{ margin: 0 }}>{isEdit ? 'Edit Student' : 'Add Student'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer', marginTop: 4 }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <LabeledField label="Student ID *"><input className="field" value={form.student_id} onChange={e => set('student_id', e.target.value)} placeholder="SCH-2024-001" /></LabeledField>
          <LabeledField label="Status"><select className="field" value={form.status} onChange={e => set('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="transferred">Transferred</option><option value="graduated">Graduated</option></select></LabeledField>
          <LabeledField label="First Name *"><input className="field" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></LabeledField>
          <LabeledField label="Last Name *"><input className="field" value={form.last_name} onChange={e => set('last_name', e.target.value)} /></LabeledField>
          <LabeledField label="Date of Birth"><input className="field" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></LabeledField>
          <LabeledField label="Gender"><select className="field" value={form.gender} onChange={e => set('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></LabeledField>
          <LabeledField label="Grade"><select className="field" value={form.grade} onChange={e => set('grade', +e.target.value)}>{GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}</select></LabeledField>
          <LabeledField label="Section"><select className="field" value={form.section} onChange={e => set('section', e.target.value)}>{['A','B','C','D'].map(s => <option key={s}>{s}</option>)}</select></LabeledField>
          <LabeledField label="Roll Number"><input className="field" type="number" value={form.roll_number} onChange={e => set('roll_number', e.target.value)} /></LabeledField>
          <LabeledField label="Guardian Name"><input className="field" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} /></LabeledField>
          <LabeledField label="Guardian Phone"><input className="field" value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} /></LabeledField>
          <LabeledField label="Guardian Email"><input className="field" type="email" value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} /></LabeledField>
          <div style={{ gridColumn: '1/-1' }}><LabeledField label="Address"><textarea className="field" rows={2} value={form.address} onChange={e => set('address', e.target.value)} /></LabeledField></div>
        </div>

        {error && <div style={{ fontFamily: 'var(--font-body)', color: 'var(--summit)', fontSize: 11, marginTop: 12, letterSpacing: '0.02em' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 1, marginTop: 20, justifyContent: 'flex-end' }}>
          {isEdit && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--summit)', borderColor: 'var(--summit)', marginRight: 'auto' }} onClick={handleDelete}>Delete</button>}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Student'}</button>
        </div>
      </div>
    </div>
  )
}

function ProfileModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [form, setForm] = useState({ learning_style: '', strengths: '', interests: '', mentor: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      const { data } = await supabase.from('student_profiles').select('*').eq('student_id', student.id).single()
      if (data) {
        setProfile(data)
        setForm({
          learning_style: data.learning_style || '',
          strengths: data.strengths || '',
          interests: data.interests || '',
          mentor: data.mentor || '',
          notes: data.notes || '',
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [student.id])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function handleSave() {
    setSaving(true)
    const payload = {
      student_id: student.id,
      learning_style: form.learning_style || null,
      strengths: form.strengths || null,
      interests: form.interests || null,
      mentor: form.mentor || null,
      notes: form.notes || null,
    }
    if (profile) {
      await supabase.from('student_profiles').update(payload).eq('id', profile.id)
    } else {
      await supabase.from('student_profiles').insert(payload)
    }
    setSaving(false)
    onClose()
  }

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal animate-in" style={{ padding: 40, textAlign: 'center' }}>Loading profile…</div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>Personalized learning profile</div>
            <h2 className="modal-title">{student.first_name} {student.last_name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--stone)', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Learning Style</label>
            <input className="field" value={form.learning_style} onChange={e => set('learning_style', e.target.value)} placeholder="Visual, kinesthetic, etc." />
          </div>
          <div>
            <label className="field-label">Mentor / House</label>
            <input className="field" value={form.mentor} onChange={e => set('mentor', e.target.value)} placeholder="Mentor name or house" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Strengths</label>
            <textarea className="field" rows={2} value={form.strengths} onChange={e => set('strengths', e.target.value)} placeholder="Academic strengths or interests" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Interests</label>
            <textarea className="field" rows={2} value={form.interests} onChange={e => set('interests', e.target.value)} placeholder="Clubs, sports, hobbies" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Personalization notes and counselor guidance" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-ink" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
