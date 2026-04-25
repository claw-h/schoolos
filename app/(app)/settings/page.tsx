import { assignUserRoleAction, createAcademicYearAction, createClassSectionAction, upsertSchoolSettingsAction } from '@/app/(app)/erp-actions'
import { getSettingsData } from '@/lib/services/settings'
import { GRADES } from '@/types/domain'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const data = await getSettingsData()

  return (
    <div>
      <div className="section-header">
        <div className="section-eyebrow">07 - Settings</div>
        <div className="section-title">School Setup</div>
        <div className="section-subtitle">Core ERP controls for school identity, academic years, classes, and sections.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 1, marginBottom: 1 }}>
        <form action={upsertSchoolSettingsAction} className="card" style={{ borderTop: '3px solid var(--ink)', display: 'grid', gap: 10 }}>
          <div className="section-eyebrow">School profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label">School name</label>
              <input className="field" name="school_name" defaultValue={data.schoolSettings?.school_name || ''} required />
            </div>
            <div>
              <label className="field-label">Short name</label>
              <input className="field" name="short_name" defaultValue={data.schoolSettings?.short_name || ''} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label">Board name</label>
              <input className="field" name="board_name" defaultValue={data.schoolSettings?.board_name || ''} placeholder="CBSE / State Board" />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input className="field" name="contact_phone" defaultValue={data.schoolSettings?.contact_phone || ''} />
            </div>
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field" name="contact_email" defaultValue={data.schoolSettings?.contact_email || ''} type="email" />
          </div>
          <div>
            <label className="field-label">Address</label>
            <textarea className="field" name="address_line" rows={3} defaultValue={data.schoolSettings?.address_line || ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label">City</label>
              <input className="field" name="city" defaultValue={data.schoolSettings?.city || ''} />
            </div>
            <div>
              <label className="field-label">State</label>
              <input className="field" name="state" defaultValue={data.schoolSettings?.state || ''} />
            </div>
            <div>
              <label className="field-label">PIN</label>
              <input className="field" name="postal_code" defaultValue={data.schoolSettings?.postal_code || ''} />
            </div>
          </div>
          <button className="btn btn-ink" type="submit">
            Save school profile
          </button>
        </form>

        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div className="section-eyebrow">Academic years</div>
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {data.academicYears.map((year) => (
              <div key={year.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{year.label}</div>
                <div className="coord">
                  {year.starts_on} to {year.ends_on} {year.is_active ? '· ACTIVE' : ''}
                </div>
              </div>
            ))}
          </div>
          <form action={createAcademicYearAction} style={{ display: 'grid', gap: 10 }}>
            <input className="field" name="label" placeholder="2025-26" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="field" name="starts_on" type="date" required />
              <input className="field" name="ends_on" type="date" required />
            </div>
            <label className="coord" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="is_active" /> Set active
            </label>
            <button className="btn btn-ghost" type="submit">
              Add academic year
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 1, marginBottom: 1 }}>
        <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Class</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {data.sections.map((section) => (
                <tr key={section.id}>
                  <td>{section.class_label || 'Unmapped class'}</td>
                  <td>{section.section_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createClassSectionAction} className="card" style={{ borderTop: '3px solid var(--ink)', display: 'grid', gap: 10 }}>
          <div className="section-eyebrow">Class + section</div>
          <div>
            <label className="field-label">Grade</label>
            <select className="field" name="grade_level" defaultValue="1">
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Section</label>
            <select className="field" name="section_name" defaultValue="A">
              {['A', 'B', 'C', 'D'].map((section) => (
                <option key={section}>{section}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-ink" type="submit">
            Add section
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 1 }}>
        <div className="card" style={{ padding: 0, borderTop: '3px solid var(--ink)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Staff member</th>
                <th>Designation</th>
                <th>Linked roles</th>
              </tr>
            </thead>
            <tbody>
              {data.linkedRoleAssignments.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <span className="coord">No auth-linked staff accounts yet. Once a staff profile has a `user_id`, assign roles here.</span>
                  </td>
                </tr>
              ) : (
                data.linkedRoleAssignments.map((assignment) => (
                  <tr key={assignment.profile_id}>
                    <td>{assignment.full_name}</td>
                    <td>{assignment.designation}</td>
                    <td>{assignment.current_roles.length ? assignment.current_roles.join(', ') : 'No ERP role assigned'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <form action={assignUserRoleAction} className="card" style={{ borderTop: '3px solid var(--ink)', display: 'grid', gap: 10 }}>
          <div className="section-eyebrow">Access roles</div>
          <div>
            <label className="field-label">Linked staff account</label>
            <select className="field" name="user_id" defaultValue="">
              <option value="">Select linked staff</option>
              {data.linkedRoleAssignments.map((assignment) => (
                <option key={assignment.profile_id} value={assignment.user_id}>
                  {assignment.full_name} · {assignment.designation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Role</label>
            <select className="field" name="role" defaultValue="office_staff">
              <option value="admin">admin</option>
              <option value="principal">principal</option>
              <option value="accounts">accounts</option>
              <option value="admissions">admissions</option>
              <option value="teacher">teacher</option>
              <option value="librarian">librarian</option>
              <option value="transport_manager">transport_manager</option>
              <option value="nurse">nurse</option>
              <option value="office_staff">office_staff</option>
            </select>
          </div>
          <button className="btn btn-ink" type="submit">
            Assign role
          </button>
        </form>
      </div>
    </div>
  )
}
