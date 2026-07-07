'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logError, isKnownNextError } from '@/lib/error-logger'

type ActionResult = { error: string } | null

export async function getBatches() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()
  if (!profile) return []

  const { data } = await supabase
    .from('batches')
    .select('*, teachers(full_name)')
    .eq('center_id', profile.center_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getBatch(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: batch } = await supabase
    .from('batches')
    .select('*, teachers(full_name)')
    .eq('id', id)
    .single()

  if (!batch) redirect('/batches')

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()

  if (profile && batch.center_id !== profile.center_id) redirect('/batches')

  return batch
}

export async function getTeachers() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()
  if (!profile) return []

  const { data } = await supabase
    .from('teachers')
    .select('id, full_name')
    .eq('center_id', profile.center_id)
    .eq('active', true)
    .order('full_name')

  return data || []
}

export async function createBatch(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('center_id')
      .eq('id', user.id)
      .single()
    if (!profile) return { error: 'Profile not found' }

    const teacherId = formData.get('teacher_id') as string

    const { error } = await supabase.from('batches').insert({
      center_id: profile.center_id,
      name: formData.get('name') as string,
      subject: (formData.get('subject') as string) || null,
      teacher_id: teacherId || null,
      schedule_text: (formData.get('schedule_text') as string) || null,
      start_time: (formData.get('start_time') as string) || null,
      end_time: (formData.get('end_time') as string) || null,
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
      active: formData.get('active') === 'on',
    })

    if (error) return { error: error.message }

    revalidatePath('/batches')
    redirect('/batches')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'createBatch', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to create batch' }
  }
}

export async function updateBatch(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('center_id')
      .eq('id', user.id)
      .single()
    if (!profile) return { error: 'Profile not found' }

    const { data: batch } = await supabase
      .from('batches')
      .select('center_id')
      .eq('id', id)
      .single()
    if (!batch || batch.center_id !== profile.center_id) return { error: 'Batch not found' }

    const teacherId = formData.get('teacher_id') as string

    const { error } = await supabase
      .from('batches')
      .update({
        name: formData.get('name') as string,
        subject: (formData.get('subject') as string) || null,
        teacher_id: teacherId || null,
        schedule_text: (formData.get('schedule_text') as string) || null,
        start_time: (formData.get('start_time') as string) || null,
        end_time: (formData.get('end_time') as string) || null,
        capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
        active: formData.get('active') === 'on',
      })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/batches')
    redirect('/batches')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'updateBatch', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to update batch' }
  }
}

export async function deleteBatch(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('batches').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/batches')
    redirect('/batches')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'deleteBatch', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to delete batch' }
  }
}
