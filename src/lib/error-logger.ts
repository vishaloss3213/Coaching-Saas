import { createAdminClient } from '@/lib/supabase/admin'

export function isKnownNextError(err: unknown): boolean {
  const digest = (err as any)?.digest
  return typeof digest === 'string' && (digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND'))
}

type LogErrorParams = {
  source: 'server_action' | 'api_route'
  name: string
  error: unknown
  center_id?: string | null
  user_id?: string | null
  url?: string | null
  metadata?: Record<string, unknown>
}

export async function logError(params: LogErrorParams): Promise<string | null> {
  try {
    const admin = createAdminClient()
    const message = params.error instanceof Error ? params.error.message : String(params.error)
    const details = params.error instanceof Error
      ? { stack: params.error.stack, name: params.error.name, ...params.metadata }
      : { raw: params.error, ...params.metadata }

    const { data, error } = await admin
      .from('error_logs')
      .insert({
        center_id: params.center_id || null,
        user_id: params.user_id || null,
        source: params.source,
        action_name: params.name,
        error_message: message,
        error_details: details,
        url: params.url || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`[error-logger] DB insert failed: ${error.message}`)
      return null
    }

    return data?.id ?? null
  } catch (e) {
    console.error('[error-logger] Failed to log error:', e)
    return null
  }
}
