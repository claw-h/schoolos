import { createSupabaseServiceClient } from '@/lib/supabase-service'
import type { Student, StudentContact, StudentEnrollment, StudentGuardian, StudentRecord } from '@/types/domain'

export async function getStudentRecords(): Promise<StudentRecord[]> {
  const admin = createSupabaseServiceClient()
  const { data: students } = await admin.from('students').select('*').order('grade').order('roll_number')

  if (!students?.length) return []

  try {
    const studentIds = students.map((student: Student) => student.id)
    const [guardiansRes, contactsRes, enrollmentsRes] = await Promise.all([
      admin.from('student_guardians').select('*').in('student_id', studentIds).order('is_primary', { ascending: false }),
      admin.from('student_contacts').select('*').in('student_id', studentIds),
      admin
        .from('student_enrollments')
        .select('id,student_id,academic_year_id,class_id,section_id,roll_number,status,academic_years(label),classes(label),sections(section_name)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false }),
    ])

    return (students as Student[]).map((student) => {
      const guardians = ((guardiansRes.data || []) as StudentGuardian[]).filter((guardian) => guardian.student_id === student.id)
      const contact = ((contactsRes.data || []) as StudentContact[]).find((row) => row.student_id === student.id) || null
      const currentEnrollmentRow = (enrollmentsRes.data || []).find((row: any) => row.student_id === student.id)
      const currentEnrollment: StudentEnrollment | null = currentEnrollmentRow
        ? {
            id: currentEnrollmentRow.id,
            student_id: currentEnrollmentRow.student_id,
            academic_year_id: currentEnrollmentRow.academic_year_id,
            class_id: currentEnrollmentRow.class_id,
            section_id: currentEnrollmentRow.section_id,
            roll_number: currentEnrollmentRow.roll_number,
            status: currentEnrollmentRow.status,
            academic_year_label: currentEnrollmentRow.academic_years?.label || null,
            class_label: currentEnrollmentRow.classes?.label || null,
            section_name: currentEnrollmentRow.sections?.section_name || null,
          }
        : null

      return { student, guardians, contact, current_enrollment: currentEnrollment }
    })
  } catch {
    return (students as Student[]).map((student) => ({
      student,
      guardians: student.guardian_name
        ? [
            {
              id: `legacy-${student.id}`,
              student_id: student.id,
              full_name: student.guardian_name,
              relationship: 'Guardian',
              phone: student.guardian_phone,
              email: student.guardian_email,
              is_primary: true,
              occupation: null,
            },
          ]
        : [],
      contact: student.address
        ? {
            id: `legacy-contact-${student.id}`,
            student_id: student.id,
            address_line: student.address,
            city: null,
            state: null,
            postal_code: null,
            emergency_contact_name: student.guardian_name,
            emergency_contact_phone: student.guardian_phone,
          }
        : null,
      current_enrollment: {
        id: `legacy-enrollment-${student.id}`,
        student_id: student.id,
        academic_year_id: 'legacy-year',
        class_id: `grade-${student.grade}`,
        section_id: null,
        roll_number: student.roll_number,
        status: student.status,
        class_label: `Grade ${student.grade}`,
        section_name: student.section,
        academic_year_label: '2024-25',
      },
    }))
  }
}
