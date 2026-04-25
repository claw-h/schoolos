import { createSupabaseServiceClient } from '@/lib/supabase-service'

type AuditInput = {
  actorUserId?: string | null
  actorRole?: string | null
  entityType: string
  entityId?: string | null
  action: string
  payload?: Record<string, unknown> | null
}

export async function logAuditEvent(input: AuditInput) {
  try {
    const admin = createSupabaseServiceClient()
    await admin.from('audit_logs').insert({
      actor_user_id: input.actorUserId || null,
      actor_role: input.actorRole || null,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      action: input.action,
      payload: input.payload || null,
    })
  } catch {
    // Audit table may not exist until the migration is applied.
  }
}
