'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function getReminderRules() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return []

  const { data } = await supabase
    .from('reminder_rules')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('trigger_type')
  return data || []
}

export async function getReminderRule(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('reminder_rules').select('*').eq('id', id).single()
  return data
}

export async function createReminderRule(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
    if (!profile) return { error: 'Profile not found' }

    const { error } = await supabase.from('reminder_rules').insert({
      center_id: profile.center_id,
      trigger_type: formData.get('trigger_type') as string,
      offset_days: parseInt(formData.get('offset_days') as string),
      channel: formData.get('channel') as string || 'whatsapp',
      template_name: (formData.get('template_name') as string) || null,
      active: formData.get('active') === 'on',
    })

    if (error) return { error: error.message }
    revalidatePath('/reminders')
    redirect('/reminders')
    return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'createReminderRule', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to create reminder rule' }
  }
}

export async function updateReminderRule(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('reminder_rules')
      .update({
        trigger_type: formData.get('trigger_type') as string,
        offset_days: parseInt(formData.get('offset_days') as string),
        channel: formData.get('channel') as string || 'whatsapp',
        template_name: (formData.get('template_name') as string) || null,
        active: formData.get('active') === 'on',
      })
      .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/reminders')
    redirect('/reminders')
    return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'updateReminderRule', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to update reminder rule' }
  }
}

export async function deleteReminderRule(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('reminder_rules').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/reminders')
    return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'deleteReminderRule', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to delete reminder rule' }
  }
}
