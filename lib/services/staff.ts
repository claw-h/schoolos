import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { normalizeERPUserRole } from '@/lib/auth/roles'
import type { StaffProfile, StaffRecord } from '@/types/domain'

export async function getStaffDirectory(): Promise<StaffRecord[]> {
  const admin = createSupabaseServiceClient()

  try {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      admin.from('staff_profiles').select('*').order('full_name'),
      admin.from('user_roles').select('*'),
    ])

    return ((profiles || []) as StaffProfile[]).map((profile) => ({
      profile,
      roles: (roles || [])
        .filter((row: any) => row.user_id === profile.user_id)
        .map((row: any) => normalizeERPUserRole(row.role)),
    }))
  } catch {
    const { data } = await admin.from('staff').select('*').order('full_name')
    return ((data || []) as any[]).map((row) => ({
      profile: {
        id: row.id,
        user_id: null,
        full_name: row.full_name,
        designation: row.role,
        department: row.department,
        phone: row.phone,
        email: row.email,
        joining_date: null,
        status: row.status,
      },
      roles: [normalizeERPUserRole(row.role)],
    }))
  }
}
