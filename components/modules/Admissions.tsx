'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, Admission } from '@/lib/supabase'

const STATUSES = ['new', 'contacted', 'shortlisted', 'enrolled', 'declined'] as const

export default function Admissions() {
  const [applications, setApplications] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Admission | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('admissions').select('*').order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  function openModal(application: Admission | null = null) {
    setSelected(application)
    setShowModal(true)
  }

  const statusCounts = STATUSES.map(status => ({ status, count: applications.filter(a => a.status === status).length }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">07 — Admissions</div>
          <div className="section-title">Enquiries & Applications</div>
          <div className="section-subtitle">Lead pipeline · follow-ups · conversion tracking</div>
        </div>
        <button className="btn btn-ink" onClick={() => openModal(null)}>
          <Plus size={12} strokeWidth={2} /> New Enquiry
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        {statusCounts.map(status => (
          <div key={status.status} className="stat-card">
            <div className="stat-value" style={{ fontSize: 30 }}>{status.count}</div>
            <div className="stat-label">{status.status.replace('_', ' ').toUpperCase()}</div>
            <div className="stat-unit">Applications</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)', fontFamily: 'var(--font-body)', fontSize: 10 }}>Loading admissions data...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.child_name}</td>
                  <td>{app.grade_applied}</td>
                  <td>{app.parent_phone || '—'}</td>
                  <td>{app.source || 'Walk-in'}</td>
                  <td><span className={`pill ${app.status === 'enrolled' ? 'pill-want' : app.status === 'contacted' ? 'pill-attempted' : app.status === 'shortlisted' ? 'pill-ink' : 'pill-ash'}`}>{app.status.replace('_', ' ')}</span></td>
                  <td>{app.notes ? app.notes.substring(0, 40) : '—'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openModal(app)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <AdmissionsModal application={selected} onClose={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function AdmissionsModal({ application, onClose }: { application: Admission | null; onClose: () => void }) {
  const isEdit = !!application
  const [form, setForm] = useState({
    child_name: application?.child_name ?? '',
    grade_applied: application?.grade_applied ?? 1,
    parent_name: application?.parent_name ?? '',
    parent_phone: application?.parent_phone ?? '',
    parent_email: application?.parent_email ?? '',
    source: application?.source ?? '',
    status: application?.status ?? 'new',
    notes: application?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  async function handleSave() {
    if (!form.child_name || !form.parent_name) return
    setSaving(true)
    const payload = {
      child_name: form.child_name,
      grade_applied: Number(form.grade_applied),
      parent_name: form.parent_name,
      parent_phone: form.parent_phone || null,
      parent_email: form.parent_email || null,
      source: form.source || null,
      status: form.status,
      notes: form.notes || null,
    }

    if (isEdit && application) {
      await supabase.from('admissions').update(payload).eq('id', application.id)
    } else {
      await supabase.from('admissions').insert(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>{isEdit ? 'Update enquiry' : 'New admission lead'}</div>
            <h2 className="modal-title">{isEdit ? 'Edit Application' : 'Add Enquiry'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Child Name</label>
            <input className="field" value={form.child_name} onChange={e => set('child_name', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Grade Applied</label>
            <input className="field" type="number" min={1} max={8} value={form.grade_applied} onChange={e => set('grade_applied', Number(e.target.value))} />
          </div>
          <div>
            <label className="field-label">Parent Name</label>
            <input className="field" value={form.parent_name} onChange={e => set('parent_name', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Parent Phone</label>
            <input className="field" value={form.parent_phone} onChange={e => set('parent_phone', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Parent Email</label>
            <input className="field" type="email" value={form.parent_email} onChange={e => set('parent_email', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Referral Source</label>
            <input className="field" value={form.source} onChange={e => set('source', e.target.value)} placeholder="Word of mouth, website, etc." />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
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
