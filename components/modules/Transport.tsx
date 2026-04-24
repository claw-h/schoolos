'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, TransportRoute } from '@/lib/supabase'

const STATUS_OPTIONS = ['active', 'inactive', 'maintenance'] as const

export default function Transport() {
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<TransportRoute | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('transport_routes').select('*').order('route_name')
    setRoutes(data || [])
    setLoading(false)
  }

  function openModal(route: TransportRoute | null = null) {
    setSelected(route)
    setShowModal(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">08 — Transport</div>
          <div className="section-title">Bus & Route Management</div>
          <div className="section-subtitle">Routes, vehicles, drivers, capacity</div>
        </div>
        <button className="btn btn-ink" onClick={() => openModal(null)}>
          <Plus size={12} strokeWidth={2} /> Add Route
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        {['active', 'maintenance', 'inactive'].map((status, index) => {
          const count = routes.filter(r => r.status === status).length
          return (
            <div key={status} className="stat-card">
              <div className="stat-value" style={{ fontSize: 30 }}>{count}</div>
              <div className="stat-label">{status.toUpperCase()}</div>
              <div className="stat-unit">Routes</div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)' }}>Loading transport records...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Capacity</th>
                <th>Stops</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id}>
                  <td>{route.route_name}</td>
                  <td>{route.vehicle_number}</td>
                  <td>{route.driver_name}</td>
                  <td>{route.capacity}</td>
                  <td>{route.stops || '—'}</td>
                  <td><span className={`pill ${route.status === 'active' ? 'pill-want' : route.status === 'maintenance' ? 'pill-attempted' : 'pill-ash'}`}>{route.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openModal(route)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <TransportModal route={selected} onClose={() => { setShowModal(false); load() }} />}
    </div>
  )
}

function TransportModal({ route, onClose }: { route: TransportRoute | null; onClose: () => void }) {
  const isEdit = !!route
  const [form, setForm] = useState({
    route_name: route?.route_name ?? '',
    vehicle_number: route?.vehicle_number ?? '',
    driver_name: route?.driver_name ?? '',
    capacity: route?.capacity?.toString() ?? '0',
    stops: route?.stops ?? '',
    status: route?.status ?? 'active',
  })
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function handleSave() {
    if (!form.route_name || !form.vehicle_number) return
    setSaving(true)
    const payload = {
      route_name: form.route_name,
      vehicle_number: form.vehicle_number,
      driver_name: form.driver_name || null,
      capacity: Number(form.capacity) || 0,
      stops: form.stops || null,
      status: form.status,
    }
    if (isEdit && route) {
      await supabase.from('transport_routes').update(payload).eq('id', route.id)
    } else {
      await supabase.from('transport_routes').insert(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>{isEdit ? 'Edit route details' : 'Add new route'}</div>
            <h2 className="modal-title">{isEdit ? 'Update Route' : 'New Transport Route'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Route Name</label>
            <input className="field" value={form.route_name} onChange={e => set('route_name', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Vehicle Number</label>
            <input className="field" value={form.vehicle_number} onChange={e => set('vehicle_number', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Driver Name</label>
            <input className="field" value={form.driver_name} onChange={e => set('driver_name', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Capacity</label>
            <input className="field" type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Stops</label>
            <textarea className="field" rows={3} value={form.stops} onChange={e => set('stops', e.target.value)} placeholder="Comma-separated stops" />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
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
