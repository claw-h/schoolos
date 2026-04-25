import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { GRADES } from '@/types/domain'
import type { AcademicYear, ERPUserRole, SchoolClass, SchoolSettings, Section } from '@/types/domain'

type SettingsData = {
  schoolSettings: SchoolSettings | null
  academicYears: AcademicYear[]
  classes: SchoolClass[]
  sections: Section[]
  linkedRoleAssignments: Array<{
    profile_id: string
    user_id: string
    full_name: string
    designation: string
    current_roles: ERPUserRole[]
  }>
}

export async function getSettingsData(): Promise<SettingsData> {
  const admin = createSupabaseServiceClient()

  try {
    const [{ data: schoolSettings }, { data: academicYears }, { data: classes }, { data: sections }, { data: staffProfiles }, { data: userRoles }] = await Promise.all([
      admin.from('school_settings').select('*').limit(1).maybeSingle(),
      admin.from('academic_years').select('*').order('starts_on', { ascending: false }),
      admin.from('classes').select('*').order('grade_level'),
      admin.from('sections').select('id,class_id,section_name,classes(label,grade_level)').order('section_name'),
      admin.from('staff_profiles').select('id,user_id,full_name,designation').not('user_id', 'is', null).order('full_name'),
      admin.from('user_roles').select('user_id,role'),
    ])

    return {
      schoolSettings: (schoolSettings || null) as SchoolSettings | null,
      academicYears: (academicYears || []) as AcademicYear[],
      classes: (classes || []) as SchoolClass[],
      sections: (sections || []).map((section: any) => ({
        id: section.id,
        class_id: section.class_id,
        section_name: section.section_name,
        class_label: section.classes?.label || null,
        grade_level: section.classes?.grade_level || null,
      })),
      linkedRoleAssignments: ((staffProfiles || []) as Array<{ id: string; user_id: string; full_name: string; designation: string }>).map((profile) => ({
        profile_id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        designation: profile.designation,
        current_roles: ((userRoles || []) as Array<{ user_id: string; role: ERPUserRole }>)
          .filter((roleRow) => roleRow.user_id === profile.user_id)
          .map((roleRow) => roleRow.role),
      })),
    }
  } catch {
    return {
      schoolSettings: null,
      academicYears: [{ id: 'fallback-year', label: '2024-25', starts_on: '2024-04-01', ends_on: '2025-03-31', is_active: true }],
      classes: GRADES.map((grade) => ({ id: `grade-${grade}`, grade_level: grade, label: `Grade ${grade}` })),
      sections: ['A', 'B', 'C', 'D'].flatMap((sectionName, index) =>
        GRADES.map((grade) => ({
          id: `fallback-${grade}-${sectionName}-${index}`,
          class_id: `grade-${grade}`,
          section_name: sectionName,
          class_label: `Grade ${grade}`,
          grade_level: grade,
        }))
      ),
      linkedRoleAssignments: [],
    }
  }
}
