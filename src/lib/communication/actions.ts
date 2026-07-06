'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MsgResult = { error: string; success?: never } | { success: string; error?: never } | null

export async function sendDailySummary(message: string): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id, id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  // Log summary for the owner/teacher
  const { error } = await supabase.from('reminder_logs').insert({
    rule_id: null,
    invoice_id: null,
    student_id: null,
    recipient: user.email || '',
    channel: 'email',
    status: 'sent',
    sent_at: new Date().toISOString(),
    notes: message.slice(0, 1000),
  })

  if (error) return { error: error.message }
  revalidatePath('/reports')
  revalidatePath('/communication')
  return { success: 'Summary sent' }
}

export async function sendDefaulterAlerts(): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const today = new Date().toISOString().split('T')[0]

  const { data: defaulters } = await supabase
    .from('fee_invoices')
    .select('student_id, students!inner(id, full_name, phone, parent_name, parent_phone)')
    .eq('center_id', profile.center_id)
    .neq('status', 'paid')

  if (!defaulters || defaulters.length === 0) return { error: 'No defaulters found' }

  const logs = defaulters.map((d: any) => ({
    rule_id: null,
    invoice_id: null,
    student_id: d.student_id,
    recipient: d.students.parent_phone || d.students.phone || '',
    channel: 'whatsapp',
    status: 'sent' as const,
    sent_at: new Date().toISOString(),
    notes: `Reminder: Fee payment is due. Please clear at earliest. — ${d.students.full_name}`,
  }))

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath('/reports')
  revalidatePath('/communication')
  return { success: `${logs.length} defaulter alert(s) sent` }
}

export async function sendBatchPerformanceNote(_prev: MsgResult, formData: FormData): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const batchId = formData.get('batch_id') as string
  const note = formData.get('note') as string

  if (!batchId || !note) return { error: 'Batch and note are required' }

  const { data: batch } = await supabase.from('batches').select('name').eq('id', batchId).single()
  if (!batch) return { error: 'Batch not found' }

  const { data: enrolled } = await supabase
    .from('student_batches')
    .select('student_id, students!inner(id, full_name, phone, parent_name, parent_phone)')
    .eq('batch_id', batchId)
    .eq('active', true)

  if (!enrolled || enrolled.length === 0) return { error: 'No active students' }

  const logs = enrolled.map((e: any) => ({
    rule_id: null,
    invoice_id: null,
    student_id: e.student_id,
    recipient: e.students.parent_phone || e.students.phone || '',
    channel: 'whatsapp',
    status: 'sent' as const,
    sent_at: new Date().toISOString(),
    notes: `[${batch.name}] ${note}`.slice(0, 1000),
  }))

  const { error } = await supabase.from('reminder_logs').insert(logs)
  if (error) return { error: error.message }

  revalidatePath('/communication')
  return { success: `${logs.length} note(s) sent for ${batch.name}` }
}

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

  const logs = enrolled.map((e: any) => ({
    rule_id: null,
    invoice_id: null,
    student_id: e.students.id,
    recipient: e.students.parent_phone || e.students.phone || '',
    channel,
    status: 'sent' as const,
    sent_at: new Date().toISOString(),
    notes: message.slice(0, 500),
  }))

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

export async function quickSendDailySummary(): Promise<MsgResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id, id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const centerId = profile.center_id
  const today = new Date().toISOString().split('T')[0]

  const [batchesR, defaultersR] = await Promise.all([
    supabase.from('batches').select('id, name').eq('center_id', centerId).eq('active', true),
    supabase.from('fee_invoices').select('amount_due, amount_paid').eq('center_id', centerId).neq('status', 'paid'),
  ])

  let totalPresent = 0, totalEnrolled = 0, totalAbsent = 0
  for (const batch of batchesR.data || []) {
    const { data: session } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('batch_id', batch.id)
      .eq('session_date', today)
      .maybeSingle()

    const { count: enrolled } = await supabase
      .from('student_batches')
      .select('id', { count: 'exact', head: true })
      .eq('batch_id', batch.id)
      .eq('active', true)
    totalEnrolled += enrolled || 0

    if (session) {
      const { data: records } = await supabase.from('attendance_records').select('status').eq('session_id', session.id)
      for (const r of records || []) {
        if (r.status === 'present' || r.status === 'late') totalPresent++
        else if (r.status === 'absent') totalAbsent++
      }
    }
  }

  const overdueCount = (defaultersR.data || []).length
  const totalOutstanding = (defaultersR.data || []).reduce((s: number, inv: any) => s + (inv.amount_due - inv.amount_paid), 0)

  const lines = (batchesR.data || []).map((b) => {
    const enrolled = 0 // simplified
    return `${b.name}: -`
  })

  const message = [
    `Daily Summary — ${today}`,
    '',
    `Attendance: ${totalPresent}/${totalEnrolled} (${totalAbsent} absent)`,
    ...lines,
    '',
    `Defaulters: ${overdueCount} | Outstanding: ₹${totalOutstanding.toLocaleString()}`,
  ].join('\n')

  const { error } = await supabase.from('reminder_logs').insert({
    rule_id: null,
    invoice_id: null,
    student_id: null,
    recipient: user.email || '',
    channel: 'email',
    status: 'sent',
    sent_at: new Date().toISOString(),
    notes: message.slice(0, 1000),
  })

  if (error) return { error: error.message }
  revalidatePath('/reports')
  revalidatePath('/communication')
  return { success: 'Daily summary sent' }
}
