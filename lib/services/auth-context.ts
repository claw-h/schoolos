import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { modulesForRoles, normalizeERPUserRole } from '@/lib/auth/roles'
import type { AcademicYear, AuthUserContext, ERPUserRole, StaffProfile } from '@/types/domain'

export const getAuthUserContext = cache(async (): Promise<AuthUserContext | null> => {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createSupabaseServiceClient()

  let fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.email === 'string'
        ? user.email
        : 'School User'

  let roles: ERPUserRole[] = []
  let staffProfile: StaffProfile | null = null
  let activeAcademicYear: AcademicYear | null = null

  try {
    const [{ data: roleRows }, { data: profileRow }, { data: yearRow }] = await Promise.all([
      admin.from('user_roles').select('role').eq('user_id', user.id),
      admin.from('staff_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      admin.from('academic_years').select('*').eq('is_active', true).maybeSingle(),
    ])

    roles = (roleRows || []).map((row: { role: string }) => normalizeERPUserRole(row.role))
    if (profileRow) {
      const typedProfile = profileRow as StaffProfile
      staffProfile = typedProfile
      fullName = typedProfile.full_name || fullName
    }
    if (yearRow) activeAcademicYear = yearRow as AcademicYear
  } catch {
    try {
      const { data: profileRow } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const typedProfile = (profileRow || null) as { full_name?: string | null; role?: string | null } | null
      if (typedProfile) {
        fullName = typedProfile.full_name || fullName
        roles = [normalizeERPUserRole(typedProfile.role)]
      }
    } catch {
      roles = [normalizeERPUserRole(user.user_metadata?.role)]
    }
  }

  if (roles.length === 0) {
    roles = [normalizeERPUserRole(user.user_metadata?.role)]
  }

  const primaryRole = roles[0] || 'admin'

  return {
    userId: user.id,
    email: user.email || '',
    fullName,
    primaryRole,
    roles,
    activeAcademicYear,
    permittedModules: modulesForRoles(roles),
    staffProfile,
  }
})

export async function requireAuthUserContext() {
  const context = await getAuthUserContext()
  if (!context) {
    throw new Error('Unauthenticated')
  }
  return context
}
