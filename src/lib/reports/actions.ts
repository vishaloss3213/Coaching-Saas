'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReportsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return null

  const centerId = profile.center_id
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  // Absentees: students with 'absent' records in last 30 days
  const { data: absentRecords } = await supabase
    .from('attendance_records')
    .select('student_id, students!inner(id, full_name, phone, parent_name, parent_phone), attendance_sessions!inner(session_date, batch_id, batches!inner(name))')
    .eq('status', 'absent')
    .gte('attendance_sessions.session_date', thirtyDaysAgo)
    .order('attendance_sessions.session_date', { ascending: false })

  // Group absentees by student
  const absentMap = new Map<string, { student: any; count: number; dates: string[]; batches: Set<string> }>()
  for (const r of absentRecords || []) {
    const sid = r.student_id
    if (!absentMap.has(sid)) {
      absentMap.set(sid, { student: (r as any).students, count: 0, dates: [], batches: new Set() })
    }
    const entry = absentMap.get(sid)!
    entry.count++
    entry.dates.push((r as any).attendance_sessions?.session_date)
    if ((r as any).attendance_sessions?.batches?.name) entry.batches.add((r as any).attendance_sessions.batches.name)
  }
  const absentees = Array.from(absentMap.values()).sort((a, b) => b.count - a.count)

  // Monthly collection: payments grouped by month
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .order('paid_at', { ascending: false })

  const monthlyMap = new Map<string, number>()
  for (const p of payments || []) {
    const month = new Date(p.paid_at).toISOString().slice(0, 7)
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + Number(p.amount))
  }
  const monthlyCollection = Array.from(monthlyMap.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => b.month.localeCompare(a.month))

  // Pending fees (summary)
  const { data: pendingInvoices } = await supabase
    .from('fee_invoices')
    .select('amount_due, amount_paid, status, due_date, students(full_name), fee_plans(name)')
    .eq('center_id', centerId)
    .neq('status', 'paid')

  const pendingTotal = (pendingInvoices || []).reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0)

  // Batch list for filter
  const { data: batches } = await supabase
    .from('batches')
    .select('id, name')
    .eq('center_id', centerId)
    .eq('active', true)
    .order('name')

  return { absentees, monthlyCollection, pendingInvoices: pendingInvoices || [], pendingTotal, batches: batches || [], today }
}
