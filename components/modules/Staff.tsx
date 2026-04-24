'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, StaffMember } from '@/lib/supabase'

const STATUS_OPTIONS = ['active', 'on_leave', 'resigned'] as const
const DEPARTMENTS = ['Administration', 'Academic', 'Finance', 'Transport', 'Library', 'Counseling'] as const

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<StaffMember | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('staff').select('*').order('status', { ascending: true }).order('full_name')
    setStaff(data || [])
    setLoading(false)
  }

  function openModal(member: StaffMember | null = null) {
    setSelected(member)
    setShowModal(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">06 — People</div>
          <div className="section-title">Staff & HR</div>
          <div className="section-subtitle">Teacher profiles · payroll · assignments</div>
        </div>
        <button className="btn btn-ink" onClick={() => openModal(null)}>
          <Plus size={12} strokeWidth={2} /> Add Staff
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        {['Active', 'On Leave', 'Resigned'].map((label, index) => {
          const count = staff.filter(s => s.status === STATUS_OPTIONS[index]).length
          return (
            <div key={label} className="stat-card">
              <div className="stat-value" style={{ fontSize: 30 }}>{count}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-unit">Staff Members</div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)', fontFamily: 'var(--font-body)', fontSize: 10 }}>Loading staff records...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id}>
                  <td>{member.full_name}</td>
                  <td>{member.role}</td>
                  <td>{member.department}</td>
                  <td>{member.salary ? `₹${member.salary.toLocaleString('en-IN')}` : '—'}</td>
                  <td>{member.phone || member.email || '—'}</td>
                  <td><span className={`pill ${member.status === 'active' ? 'pill-want' : member.status === 'on_leave' ? 'pill-attempted' : 'pill-ash'}`}>{member.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openModal(member)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <StaffModal member={selected} onClose={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function StaffModal({ member, onClose }: { member: StaffMember | null; onClose: () => void }) {
  const isEdit = !!member
  const [form, setForm] = useState({
    full_name: member?.full_name ?? '',
    role: member?.role ?? 'Teacher',
    department: member?.department ?? 'Academic',
    phone: member?.phone ?? '',
    email: member?.email ?? '',
    salary: member?.salary?.toString() ?? '',
    status: member?.status ?? 'active',
    notes: member?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string) => setForm(s => ({ ...s, [key]: value }))

  async function handleSave() {
    if (!form.full_name || !form.role) return
    setSaving(true)
    const payload = {
      full_name: form.full_name,
      role: form.role,
      department: form.department,
      phone: form.phone || null,
      email: form.email || null,
      salary: form.salary ? parseFloat(form.salary) : null,
      status: form.status,
      notes: form.notes || null,
    }
    if (isEdit && member) {
      await supabase.from('staff').update(payload).eq('id', member.id)
    } else {
      await supabase.from('staff').insert(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>{isEdit ? 'Edit staff member' : 'New staff record'}</div>
            <h2 className="modal-title">{isEdit ? 'Update Profile' : 'Add Staff'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Full Name</label>
            <input className="field" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Role</label>
            <input className="field" value={form.role} onChange={e => set('role', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Department</label>
            <select className="field" value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="field" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Salary (₹)</label>
            <input className="field" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
