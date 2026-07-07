'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function getStudentInvoices(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: invoices } = await supabase
    .from('fee_invoices')
    .select('*, fee_plans(name, cycle_type, amount)')
    .eq('student_id', studentId)
    .order('period_start', { ascending: false })

  return invoices || []
}

export async function getStudentBatches(studentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_batches')
    .select('*, batches(id, name, schedule_text, start_time, end_time)')
    .eq('student_id', studentId)
    .eq('active', true)
  return (data || []).map((e: any) => e.batches).filter(Boolean)
}
