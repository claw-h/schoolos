import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { EXAM_TYPES, gradeToLetter } from '@/types/domain'
import type { AcademicRecord, Student, Subject } from '@/types/domain'

export async function getAcademicsOverview() {
  const admin = createSupabaseServiceClient()
  const [studentsRes, subjectsRes, recordsRes] = await Promise.all([
    admin.from('students').select('*').eq('status', 'active').order('grade').order('roll_number'),
    admin.from('subjects').select('*').order('grade').order('name'),
    admin.from('academic_records').select('*').eq('academic_year', '2024-25'),
  ])

  const students = (studentsRes.data || []) as Student[]
  const subjects = (subjectsRes.data || []) as Subject[]
  const records = (recordsRes.data || []) as AcademicRecord[]

  const recentExam = EXAM_TYPES.find((item) => item.value === 'mid_term')?.label || 'Mid Term'
  const avgPercent =
    records.length === 0
      ? null
      : records.reduce((sum, row) => sum + ((Number(row.marks_obtained || 0) / Number(row.max_marks || 100)) * 100 || 0), 0) / records.length

  return {
    students,
    subjects,
    records,
    recentExam,
    avgPercent,
    avgGrade: avgPercent == null ? null : gradeToLetter(avgPercent),
  }
}
