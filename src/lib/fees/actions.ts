'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

function getCenterProfile(supabase: any, userId: string) {
  return supabase.from('profiles').select('center_id, id').eq('id', userId).single().then((r: any) => r.data)
}

export async function getFeePlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const profile = await getCenterProfile(supabase, user.id)
  if (!profile) return []

  const { data } = await supabase
    .from('fee_plans')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('name')
  return data || []
}

export async function getFeePlan(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('fee_plans').select('*').eq('id', id).single()
  return data
}

export async function createFeePlan(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const profile = await getCenterProfile(supabase, user.id)
  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase.from('fee_plans').insert({
    center_id: profile.center_id,
    name: formData.get('name') as string,
    amount: parseFloat(formData.get('amount') as string),
    cycle_type: formData.get('cycle_type') as string,
    due_day: formData.get('due_day') ? parseInt(formData.get('due_day') as string) : null,
    active: formData.get('active') === 'on',
  })

  if (error) return { error: error.message }
  revalidatePath('/fee-plans')
  redirect('/fee-plans')
  return null
}

export async function updateFeePlan(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fee_plans')
    .update({
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      cycle_type: formData.get('cycle_type') as string,
      due_day: formData.get('due_day') ? parseInt(formData.get('due_day') as string) : null,
      active: formData.get('active') === 'on',
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/fee-plans')
  redirect('/fee-plans')
  return null
}

export async function deleteFeePlan(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('fee_plans').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/fee-plans')
  return null
}
