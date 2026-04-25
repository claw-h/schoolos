import { createSupabaseServiceClient } from '@/lib/supabase-service'
import type { AdmissionRecord } from '@/types/domain'

export async function getAdmissions(): Promise<AdmissionRecord[]> {
  const admin = createSupabaseServiceClient()

  try {
    const { data } = await admin.from('admissions').select('*').order('created_at', { ascending: false })
    return (data || []) as AdmissionRecord[]
  } catch {
    return []
  }
}
