'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function getBatchWithStudents(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: batch } = await supabase
    .from('batches')
    .select('*, teachers(full_name)')
    .eq('id', id)
    .single()

  if (!batch || batch.center_id !== profile.center_id) redirect('/batches')

  const { data: enrolled } = await supabase
    .from('student_batches')
    .select('id, joined_at, students(id, full_name, phone, status)')
    .eq('batch_id', id)
    .eq('active', true)
    .order('joined_at', { ascending: false })

  return { batch, enrolled: enrolled || [] }
}

export async function getAvailableStudents(batchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return []

  const { data: enrolled } = await supabase
    .from('student_batches')
    .select('student_id')
    .eq('batch_id', batchId)
    .eq('active', true)

  const enrolledIds = enrolled?.map((e) => e.student_id) || []

  const { data: available } = await supabase
    .from('students')
    .select('id, full_name, phone, parent_name')
    .eq('center_id', profile.center_id)
    .eq('status', 'active')
    .not('id', 'in', `(${enrolledIds.map((id) => `"${id}"`).join(',')})`)
    .order('full_name')

  return available || []
}

export async function enrollStudents(batchId: string, _prev: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  try {
    const supabase = await createClient()
  const studentIds = formData.getAll('student_ids') as string[]

  if (studentIds.length === 0) return { error: 'Select at least one student' }

  const rows = studentIds.map((studentId) => ({
    student_id: studentId,
    batch_id: batchId,
  }))

  const { error } = await supabase.from('student_batches').insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/batches/${batchId}`)
  redirect(`/batches/${batchId}`)
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'enrollStudents', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to enroll students' }
  }
}

export async function removeStudent(batchId: string, studentId: string): Promise<{ error: string } | null> {
  try {
    const supabase = await createClient()
  const { error } = await supabase
    .from('student_batches')
    .update({ active: false, left_at: new Date().toISOString() })
    .eq('batch_id', batchId)
    .eq('student_id', studentId)
    .eq('active', true)

  if (error) return { error: error.message }

  revalidatePath(`/batches/${batchId}`)
  return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'removeStudent', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to remove student' }
  }
}
