'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function bulkMarkOverdue(invoiceIds: string[]): Promise<ActionResult> {
  try {
    const supabase = await createClient()
  const { error } = await supabase
    .from('fee_invoices')
    .update({ status: 'overdue' })
    .in('id', invoiceIds)
    .eq('status', 'pending')

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/invoices')
  return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'bulkMarkOverdue', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to mark overdue' }
  }
}

export async function bulkSendReminders(invoiceIds: string[]): Promise<ActionResult> {
  try {
    const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const { data: invoices } = await supabase
    .from('fee_invoices')
    .select('id, student_id, students!inner(phone, parent_phone)')
    .in('id', invoiceIds)

  const { data: rules } = await supabase
    .from('reminder_rules')
    .select('*')
    .eq('center_id', profile.center_id)
    .eq('active', true)
    .in('trigger_type', ['fee_due', 'fee_overdue', 'custom'])

  if (!rules || rules.length === 0) return { error: 'No active reminder rules' }
  if (!invoices || invoices.length === 0) return { error: 'No invoices found' }

  const logs = invoices.flatMap((inv) =>
    rules.map((rule) => ({
      rule_id: rule.id,
      invoice_id: inv.id,
      student_id: inv.student_id,
      recipient: (inv as any).students?.phone || (inv as any).students?.parent_phone || '',
      channel: rule.channel,
      status: 'sent' as const,
      sent_at: new Date().toISOString(),
      error_message: null,
    })),
  )

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/invoices')
  return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'bulkSendReminders', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to send reminders' }
  }
}
