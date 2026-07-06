'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { error: string } | null

export async function getSessions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return []

  const { data } = await supabase
    .from('attendance_sessions')
    .select('*, batches(name, subject)')
    .eq('center_id', profile.center_id)
    .order('session_date', { ascending: false })

  return data || []
}

export async function getSession(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('*, batches(name, subject), profiles(full_name)')
    .eq('id', id)
    .single()

  if (!session) redirect('/attendance')

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*, students(full_name, phone)')
    .eq('session_id', id)
    .order('created_at')

  return { session, records: records || [] }
}

export async function getBatchesForAttendance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return []

  const { data } = await supabase
    .from('batches')
    .select('id, name, subject')
    .eq('center_id', profile.center_id)
    .eq('active', true)
    .order('name')

  return data || []
}

export async function getEnrolledStudents(batchId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_batches')
    .select('student_id, students(id, full_name, phone)')
    .eq('batch_id', batchId)
    .eq('active', true)
    .order('joined_at')

  return (data || []).map((e: any) => e.students).filter(Boolean)
}

export async function createSession(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('center_id, id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const batchId = formData.get('batch_id') as string
  const sessionDate = formData.get('session_date') as string
  const startTime = (formData.get('start_time') as string) || null
  const endTime = (formData.get('end_time') as string) || null
  const mode = (formData.get('mode') as string) || 'offline'

  if (!batchId || !sessionDate) return { error: 'Batch and date are required' }

  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .insert({
      center_id: profile.center_id,
      batch_id: batchId,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      mode,
      created_by: profile.id,
    })
    .select('id')
    .single()

  if (sessionError) return { error: sessionError.message }

  const studentIds = formData.getAll('student_ids') as string[]
  const statuses = formData.getAll('statuses') as string[]

  if (studentIds.length === 0) return { error: 'No students in this batch' }

  const records = studentIds.map((studentId, i) => ({
    session_id: session.id,
    student_id: studentId,
    status: (statuses[i] as any) || 'present',
    check_in_method: 'manual',
  }))

  const { error: recordsError } = await supabase.from('attendance_records').insert(records)
  if (recordsError) return { error: recordsError.message }

  revalidatePath('/attendance')
  redirect('/attendance')
}

export async function updateRecordStatus(sessionId: string, studentId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('attendance_records')
    .update({ status, check_in_time: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('student_id', studentId)

  if (error) return { error: error.message }

  revalidatePath(`/attendance/${sessionId}`)
  return null
}
