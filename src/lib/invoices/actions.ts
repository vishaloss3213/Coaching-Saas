'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

export async function getInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return []

  const { data } = await supabase
    .from('fee_invoices')
    .select('*, students(full_name, phone), fee_plans(name, cycle_type)')
    .eq('center_id', profile.center_id)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getInvoice(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fee_invoices')
    .select('*, students(full_name, phone, parent_name, parent_phone), fee_plans(name, cycle_type, amount)')
    .eq('id', id)
    .single()

  if (!data) redirect('/invoices')

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', id)
    .order('paid_at', { ascending: false })

  return { invoice: data, payments: payments || [] }
}

export async function getStudentsAndPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { students: [], plans: [], batches: [] }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()

  const [studentsR, plansR, batchesR] = await Promise.all([
    supabase.from('students').select('id, full_name, phone').eq('center_id', profile!.center_id).eq('status', 'active').order('full_name'),
    supabase.from('fee_plans').select('*').eq('center_id', profile!.center_id).eq('active', true).order('name'),
    supabase.from('batches').select('id, name').eq('center_id', profile!.center_id).eq('active', true).order('name'),
  ])

  return { students: studentsR.data || [], plans: plansR.data || [], batches: batchesR.data || [] }
}

function getDueDate(cycleType: string, periodStart: string, dueDay: number | null): string {
  const start = new Date(periodStart)
  if (dueDay) {
    const d = new Date(start.getFullYear(), start.getMonth(), dueDay)
    if (d < start) d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }
  const end = new Date(start)
  if (cycleType === 'monthly') end.setMonth(end.getMonth() + 1)
  else if (cycleType === 'quarterly') end.setMonth(end.getMonth() + 3)
  else if (cycleType === 'half_yearly') end.setMonth(end.getMonth() + 6)
  else if (cycleType === 'yearly') end.setFullYear(end.getFullYear() + 1)
  end.setDate(end.getDate() - 1)
  return end.toISOString().split('T')[0]
}

function getPeriodEnd(cycleType: string, periodStart: string): string {
  const start = new Date(periodStart)
  const end = new Date(start)
  if (cycleType === 'monthly') end.setMonth(end.getMonth() + 1)
  else if (cycleType === 'quarterly') end.setMonth(end.getMonth() + 3)
  else if (cycleType === 'half_yearly') end.setMonth(end.getMonth() + 6)
  else if (cycleType === 'yearly') end.setFullYear(end.getFullYear() + 1)
  end.setDate(end.getDate() - 1)
  return end.toISOString().split('T')[0]
}

export async function generateInvoices(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const planId = formData.get('fee_plan_id') as string
  const periodStart = formData.get('period_start') as string
  const studentIds = (formData.getAll('student_ids') as string[]).filter(Boolean)

  if (!planId || !periodStart || studentIds.length === 0) return { error: 'Plan, period, and students required' }

  const { data: plan } = await supabase.from('fee_plans').select('*').eq('id', planId).single()
  if (!plan) return { error: 'Fee plan not found' }

  const periodEnd = getPeriodEnd(plan.cycle_type, periodStart)
  const dueDate = getDueDate(plan.cycle_type, periodStart, plan.due_day)

  const rows = studentIds.map((sid) => ({
    center_id: profile.center_id,
    student_id: sid,
    fee_plan_id: planId,
    period_start: periodStart,
    period_end: periodEnd,
    due_date: dueDate,
    amount_due: plan.amount,
    amount_paid: 0,
    status: 'pending' as const,
  }))

  const { error } = await supabase.from('fee_invoices').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/invoices')
  redirect('/invoices')
  return null
}

export async function recordPayment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const invoiceId = formData.get('invoice_id') as string
  const studentId = formData.get('student_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const method = (formData.get('method') as string) || 'cash'
  const reference = (formData.get('reference') as string) || null

  if (!amount || amount <= 0) return { error: 'Amount must be positive' }

  const { data: invoice } = await supabase.from('fee_invoices').select('*').eq('id', invoiceId).single()
  if (!invoice) return { error: 'Invoice not found' }

  const newPaid = invoice.amount_paid + amount
  if (newPaid > invoice.amount_due) return { error: 'Payment exceeds amount due' }

  const { error: payError } = await supabase.from('payments').insert({
    invoice_id: invoiceId,
    student_id: studentId,
    amount,
    method,
    reference,
  })
  if (payError) return { error: payError.message }

  const newStatus = newPaid >= invoice.amount_due ? 'paid' : 'pending'
  await supabase.from('fee_invoices').update({ amount_paid: newPaid, status: newStatus }).eq('id', invoiceId)

  revalidatePath(`/invoices/${invoiceId}`)
  redirect(`/invoices/${invoiceId}`)
  return null
}

export async function getBatchAndPlans(batchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { batch: null, students: [], plans: [] }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { batch: null, students: [], plans: [] }

  const [batchR, studentsR, plansR] = await Promise.all([
    supabase.from('batches').select('id, name').eq('id', batchId).eq('center_id', profile.center_id).single(),
    supabase.from('student_batches').select('students!inner(id, full_name, phone)').eq('batch_id', batchId).eq('active', true),
    supabase.from('fee_plans').select('*').eq('center_id', profile.center_id).eq('active', true).order('name'),
  ])

  return {
    batch: batchR.data,
    students: (studentsR.data || []).map((e: any) => e.students).filter(Boolean),
    plans: plansR.data || [],
  }
}

export async function generateBatchInvoices(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return { error: 'Profile not found' }

  const batchId = formData.get('batch_id') as string
  const planId = formData.get('fee_plan_id') as string
  const periodStart = formData.get('period_start') as string

  if (!batchId || !planId || !periodStart) return { error: 'Batch, plan, and period are required' }

  const { data: plan } = await supabase.from('fee_plans').select('*').eq('id', planId).single()
  if (!plan) return { error: 'Fee plan not found' }

  const { data: enrolled } = await supabase
    .from('student_batches')
    .select('student_id')
    .eq('batch_id', batchId)
    .eq('active', true)

  if (!enrolled || enrolled.length === 0) return { error: 'No active students in this batch' }

  const periodEnd = getPeriodEnd(plan.cycle_type, periodStart)
  const dueDate = getDueDate(plan.cycle_type, periodStart, plan.due_day)

  const rows = enrolled.map((e) => ({
    center_id: profile.center_id,
    student_id: e.student_id,
    fee_plan_id: planId,
    period_start: periodStart,
    period_end: periodEnd,
    due_date: dueDate,
    amount_due: plan.amount,
    amount_paid: 0,
    status: 'pending' as const,
  }))

  const { error } = await supabase.from('fee_invoices').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/invoices')
  redirect('/invoices')
  return null
}
