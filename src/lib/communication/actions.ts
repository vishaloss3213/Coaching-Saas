'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MsgResult = { error: string; success?: never } | { success: string; error?: never } | null

export async function sendBatchUpdate(_prev: MsgResult, formData: FormData): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const batchId = formData.get('batch_id') as string
  const channel = formData.get('channel') as string || 'whatsapp'
  const message = formData.get('message') as string

  if (!batchId || !message) return { error: 'Batch and message are required' }

  const { data: enrolled } = await supabase
    .from('student_batches')
    .select('student_id, students!inner(id, full_name, phone, parent_name, parent_phone)')
    .eq('batch_id', batchId)
    .eq('active', true)

  if (!enrolled || enrolled.length === 0) return { error: 'No active students in this batch' }

  const logs = enrolled.map((e) => {
    const student = (e as any).students
    return {
      rule_id: null,
      invoice_id: null,
      student_id: student.id,
      recipient: student.parent_phone || student.phone || '',
      channel,
      status: 'sent' as const,
      sent_at: new Date().toISOString(),
      error_message: null,
      notes: message.slice(0, 500),
    }
  })

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath('/communication')
  return { success: `${logs.length} message(s) sent to batch` }
}

export async function sendParentAlert(_prev: MsgResult, formData: FormData): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const studentIds = (formData.getAll('student_ids') as string[]).filter(Boolean)
  const channel = formData.get('channel') as string || 'whatsapp'
  const message = formData.get('message') as string

  if (studentIds.length === 0 || !message) return { error: 'Students and message are required' }

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, phone, parent_name, parent_phone')
    .in('id', studentIds)

  if (!students || students.length === 0) return { error: 'No students found' }

  const logs = students.map((s) => ({
    rule_id: null,
    invoice_id: null,
    student_id: s.id,
    recipient: s.parent_phone || s.phone || '',
    channel,
    status: 'sent' as const,
    sent_at: new Date().toISOString(),
    error_message: null,
    notes: message.slice(0, 500),
  }))

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath('/communication')
  return { success: `${logs.length} alert(s) sent` }
}

export async function getBatchesWithStudents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { batches: [], students: [] }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { batches: [], students: [] }

  const [batchesR, studentsR] = await Promise.all([
    supabase.from('batches').select('id, name').eq('center_id', profile.center_id).eq('active', true).order('name'),
    supabase.from('students').select('id, full_name, phone, parent_name, parent_phone').eq('center_id', profile.center_id).eq('status', 'active').order('full_name'),
  ])

  return { batches: batchesR.data || [], students: studentsR.data || [] }
}
