'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, LibraryBook, LibraryIssue, Student } from '@/lib/supabase'

export default function Library() {
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [issues, setIssues] = useState<LibraryIssue[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [bRes, iRes, sRes] = await Promise.all([
      supabase.from('library_books').select('*').order('title'),
      supabase.from('library_issues').select('*, students(first_name,last_name,grade)').order('issued_at', { ascending: false }),
      supabase.from('students').select('id,first_name,last_name,grade').eq('status', 'active').order('grade').order('last_name'),
    ])
    setBooks(bRes.data || [])
    setIssues(iRes.data || [])
    setStudents((sRes.data as any) || [])
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-eyebrow">09 — Library</div>
          <div className="section-title">Library & Assets</div>
          <div className="section-subtitle">Books, issues, return tracking</div>
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
          <button className="btn btn-ghost" onClick={() => setShowIssueModal(true)}>
            <Plus size={12} strokeWidth={2} /> Issue Book
          </button>
          <button className="btn btn-ink" onClick={() => setShowBookModal(true)}>
            <Plus size={12} strokeWidth={2} /> Add Book
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'Books', value: books.length },
          { label: 'Active Issues', value: issues.filter(issue => !issue.returned_at).length },
          { label: 'Returns', value: issues.filter(issue => issue.returned_at).length },
        ].map(box => (
          <div key={box.label} className="stat-card">
            <div className="stat-value" style={{ fontSize: 30 }}>{box.value}</div>
            <div className="stat-label">{box.label}</div>
            <div className="stat-unit">Records</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)' }}>Loading library data...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th>Issued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author || '—'}</td>
                  <td>{book.isbn || '—'}</td>
                  <td>{book.copies}</td>
                  <td>{issues.filter(issue => issue.book_id === book.id && !issue.returned_at).length}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => { setSelectedBook(book); setShowIssueModal(true) }}>Issue</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: 1, borderTop: '3px solid var(--ink)' }}>
        <div className="section-eyebrow">Recent Activity</div>
        {issues.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--stone)' }}>No issue history yet.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Student</th><th>Book</th><th>Issued</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {issues.slice(0, 10).map(issue => (
                <tr key={issue.id}>
                  <td>{issue.students ? `${issue.students.first_name} ${issue.students.last_name}` : '—'}</td>
                  <td>{issue.book_title || '—'}</td>
                  <td>{issue.issued_at}</td>
                  <td>{issue.due_date || '—'}</td>
                  <td>{issue.returned_at ? <span className="pill pill-want">Returned</span> : <span className="pill pill-attempted">Issued</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showBookModal && <BookModal onClose={() => { setShowBookModal(false); load() }} />}
      {showIssueModal && <IssueModal students={students} books={books} selectedBook={selectedBook} onClose={() => { setSelectedBook(null); setShowIssueModal(false); load() }} />}
    </div>
  )
}

function BookModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', copies: '1' })
  const [saving, setSaving] = useState(false)
  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function save() {
    if (!form.title) return
    setSaving(true)
    await supabase.from('library_books').insert({ title: form.title, author: form.author || null, isbn: form.isbn || null, copies: Number(form.copies) || 1 })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>Add a new library book</div>
            <h2 className="modal-title">Add Book</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Title</label>
            <input className="field" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Author</label>
            <input className="field" value={form.author} onChange={e => set('author', e.target.value)} />
          </div>
          <div>
            <label className="field-label">ISBN</label>
            <input className="field" value={form.isbn} onChange={e => set('isbn', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Copies</label>
            <input className="field" type="number" value={form.copies} onChange={e => set('copies', e.target.value)} />
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

function IssueModal({ students, books, selectedBook, onClose }: { students: Student[]; books: LibraryBook[]; selectedBook: LibraryBook | null; onClose: () => void }) {
  const [form, setForm] = useState({ student_id: '', book_id: selectedBook?.id ?? '', issued_at: new Date().toISOString().split('T')[0], due_date: '', book_title: selectedBook?.title ?? '' })
  const [saving, setSaving] = useState(false)
  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  async function save() {
    if (!form.student_id || !form.book_id) return
    setSaving(true)
    await supabase.from('library_issues').insert({ student_id: form.student_id, book_id: form.book_id, book_title: form.book_title, issued_at: form.issued_at, due_date: form.due_date || null, returned_at: null })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="coord" style={{ marginBottom: 4 }}>Issue a book to a student</div>
            <h2 className="modal-title">Issue Book</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Book</label>
            <select className="field" value={form.book_id} onChange={e => {
              const book = books.find(b => b.id === e.target.value)
              set('book_id', e.target.value)
              set('book_title', book?.title ?? '')
            }}>
              <option value="">Select book...</option>
              {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="field-label">Student</label>
            <select className="field" value={form.student_id} onChange={e => set('student_id', e.target.value)}>
              <option value="">Select student...</option>
              {students.map(student => <option key={student.id} value={student.id}>{student.first_name} {student.last_name} — Grade {student.grade}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Issue Date</label>
            <input className="field" type="date" value={form.issued_at} onChange={e => set('issued_at', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Due Date</label>
            <input className="field" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ink" onClick={save} disabled={saving}>{saving ? 'Issuing...' : 'Issue'}</button>
        </div>
      </div>
    </div>
  )
}
