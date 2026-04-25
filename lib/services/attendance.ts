import { createSupabaseServiceClient } from '@/lib/supabase-service'
import type { AttendanceRecord, AttendanceSummary, Section, Student } from '@/types/domain'

export async function getAttendanceData(date: string) {
  const admin = createSupabaseServiceClient()
  const [studentsRes, attendanceRes] = await Promise.all([
    admin.from('students').select('*').eq('status', 'active').order('grade').order('roll_number'),
    admin.from('attendance').select('*').eq('date', date),
  ])

  const students = (studentsRes.data || []) as Student[]
  const records = (attendanceRes.data || []) as AttendanceRecord[]
  const summaryBySection = new Map<string, AttendanceSummary>()

  students.forEach((student) => {
    const record = records.find((row) => row.student_id === student.id)
    const key = `${student.grade}-${student.section}`
    if (!summaryBySection.has(key)) {
      summaryBySection.set(key, {
        session_date: date,
        class_label: `Grade ${student.grade}`,
        section_name: student.section,
        totals: { present: 0, absent: 0, late: 0, excused: 0 },
      })
    }
    if (record) {
      summaryBySection.get(key)!.totals[record.status] += 1
    }
  })

  const sections: Section[] = Array.from(
    new Map(
      students.map((student) => [
        `${student.grade}-${student.section}`,
        {
          id: `${student.grade}-${student.section}`,
          class_id: `grade-${student.grade}`,
          section_name: student.section,
          class_label: `Grade ${student.grade}`,
          grade_level: student.grade,
        },
      ])
    ).values()
  )

  return {
    students,
    records,
    sections,
    summaries: Array.from(summaryBySection.values()),
  }
}
