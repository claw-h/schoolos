import { recordAttendanceAction } from '@/app/(app)/erp-actions'
import { getAttendanceData } from '@/lib/services/attendance'

export const dynamic = 'force-dynamic'

type AttendancePageProps = {
  searchParams?: {
    date?: string
  }
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const date = searchParams?.date || new Date().toISOString().slice(0, 10)
  const data = await getAttendanceData(date)

  return (
    <div>
      <div className="section-header">
        <div className="section-eyebrow">03 - Attendance</div>
        <div className="section-title">Daily Attendance</div>
        <div className="section-subtitle">Class-wise attendance capture using server actions with date-based summaries.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, marginBottom: 1 }}>
        <div className="stat-card">
          <div className="stat-value">{data.students.length}</div>
          <div className="stat-label">Students in sheet</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.records.filter((row) => row.status === 'present').length}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--summit)' }}>
            {data.records.filter((row) => row.status === 'absent').length}
          </div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.sections.length}</div>
          <div className="stat-label">Sections represented</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 1 }}>
        <form action={recordAttendanceAction} className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="section-eyebrow">Daily sheet</div>
            <input className="field" type="date" name="attendance_date" defaultValue={date} style={{ maxWidth: 180 }} />
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Section</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => {
                const existing = data.records.find((row) => row.student_id === student.id)
                return (
                  <tr key={student.id}>
                    <td>
                      <input type="hidden" name="student_id" value={student.id} />
                      <div style={{ fontWeight: 600 }}>
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="coord">{student.student_id}</div>
                    </td>
                    <td>
                      Grade {student.grade} · {student.section}
                    </td>
                    <td>
                      <select className="field" name={`status_${student.id}`} defaultValue={existing?.status || 'present'}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td>
                      <input className="field" name={`remarks_${student.id}`} defaultValue={existing?.remarks || ''} placeholder="Optional note" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-ink" type="submit">
              Save attendance
            </button>
          </div>
        </form>

        <div className="card" style={{ borderTop: '3px solid var(--ink)' }}>
          <div className="section-eyebrow">Section summary</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {data.summaries.map((summary) => (
              <div key={`${summary.class_label}-${summary.section_name}`} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>
                  {summary.class_label} · {summary.section_name}
                </div>
                <div className="coord">
                  Present {summary.totals.present} · Absent {summary.totals.absent} · Late {summary.totals.late} · Excused {summary.totals.excused}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
