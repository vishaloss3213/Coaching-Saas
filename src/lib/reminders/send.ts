'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function sendRemindersForInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const { data: invoice } = await supabase
    .from('fee_invoices')
    .select('*, students(full_name, phone, parent_name, parent_phone)')
    .eq('id', invoiceId)
    .single()
  if (!invoice) return { error: 'Invoice not found' }

  const { data: rules } = await supabase
    .from('reminder_rules')
    .select('*')
    .eq('center_id', profile.center_id)
    .eq('active', true)
    .in('trigger_type', ['fee_due', 'fee_overdue', 'custom'])

  if (!rules || rules.length === 0) return { error: 'No active reminder rules found' }

  const logs = rules.map((rule) => ({
    rule_id: rule.id,
    invoice_id: invoiceId,
    student_id: invoice.student_id,
    recipient: invoice.students?.phone || invoice.students?.parent_phone || '',
    channel: rule.channel,
    status: 'sent' as const,
    sent_at: new Date().toISOString(),
    error_message: null,
  }))

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath(`/invoices/${invoiceId}`)
  return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'sendRemindersForInvoice', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to send reminders' }
  }
}
