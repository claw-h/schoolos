import { redirect } from 'next/navigation'
import { AppShell } from '@/components/erp/app-shell'
import { signOutAction } from '@/app/auth-actions'
import { requireAuthUserContext } from '@/lib/services/auth-context'
import { createSupabaseServiceClient } from '@/lib/supabase-service'

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuthUserContext().catch(() => null)

  if (!auth) {
    redirect('/login')
  }

  let schoolName = 'CJHS'

  try {
    const admin = createSupabaseServiceClient()
    const { data } = await admin.from('school_settings').select('*').limit(1).maybeSingle()
    const schoolSettings = (data || null) as { school_name?: string | null } | null
    if (schoolSettings?.school_name) schoolName = schoolSettings.school_name
  } catch {
    schoolName = 'SchoolOS ERP'
  }

  return (
    <AppShell user={auth} schoolName={schoolName} onSignOut={signOutAction}>
      {children}
    </AppShell>
  )
}
