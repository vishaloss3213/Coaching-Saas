'use server'

import { createClient } from '@/lib/supabase/server'
import { logError, isKnownNextError } from '@/lib/error-logger'

export async function getReportsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return null

  const centerId = profile.center_id
  const today = new Date().toISOString().split('T')[0]

  // ── 1. Batches with today's attendance ──
  const { data: batches } = await supabase
    .from('batches')
    .select('id, name, subject, schedule_text, start_time, end_time')
    .eq('center_id', centerId)
    .eq('active', true)
    .order('name')

  const batchAttendance = await Promise.all((batches || []).map(async (batch) => {
    // Today's session for this batch
    const { data: session } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('batch_id', batch.id)
      .eq('session_date', today)
      .maybeSingle()

    let total = 0, present = 0, absent = 0, late = 0, excused = 0
    if (session) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('session_id', session.id)
      total = records?.length || 0
      for (const r of records || []) {
        if (r.status === 'present') present++
        else if (r.status === 'absent') absent++
        else if (r.status === 'late') late++
        else if (r.status === 'excused') excused++
      }
    }

    // Total enrolled
    const { count: enrolled } = await supabase
      .from('student_batches')
      .select('id', { count: 'exact', head: true })
      .eq('batch_id', batch.id)
      .eq('active', true)

    return {
      ...batch,
      sessionTaken: !!session,
      enrolledCount: enrolled || 0,
      total,
      present,
      absent,
      late,
      excused,
      attendancePct: total > 0 ? Math.round((present + late) / total * 100) : null,
    }
  }))

  // ── 2. Fee defaulters (overdue / pending past due) ──
  const { data: defaulters } = await supabase
    .from('fee_invoices')
    .select('*, students!inner(id, full_name, phone, parent_name, parent_phone), fee_plans(name, cycle_type)')
    .eq('center_id', centerId)
    .neq('status', 'paid')
    .order('due_date', { ascending: true })

  const defaulterList = (defaulters || []).map((inv: any) => {
    const bal = inv.amount_due - inv.amount_paid
    const dueDate = new Date(inv.due_date)
    const daysOverdue = Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / 86400000))
    return {
      id: inv.id,
      student: inv.students,
      plan: inv.fee_plans,
      dueDate: inv.due_date,
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      balance: bal,
      daysOverdue,
      status: daysOverdue > 0 ? 'overdue' : 'pending',
    }
  })

  const overdueCount = defaulterList.filter((d: any) => d.daysOverdue > 0).length
  const totalOutstanding = defaulterList.reduce((s: number, d: any) => s + d.balance, 0)

  // ── 3. Batch performance (last 30 days attendance %) ──
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const batchPerformance = await Promise.all((batches || []).map(async (batch) => {
    const { data: sessions } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('batch_id', batch.id)
      .gte('session_date', thirtyDaysAgo)
      .lte('session_date', today)

    const sessionIds = (sessions || []).map((s) => s.id)
    let totalMarks = 0, presentMarks = 0

    if (sessionIds.length > 0) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .in('session_id', sessionIds)

      totalMarks = records?.length || 0
      for (const r of records || []) {
        if (r.status === 'present' || r.status === 'late') presentMarks++
      }
    }

    return {
      name: batch.name,
      sessions: sessionIds.length,
      totalMarks,
      presentMarks,
      pct: totalMarks > 0 ? Math.round(presentMarks / totalMarks * 100) : null,
    }
  }))

  // ── 4. Weekly collection trend (last 8 weeks) ──
  const eightWeeksAgo = new Date(Date.now() - 56 * 86400000).toISOString()
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .gte('paid_at', eightWeeksAgo)
    .order('paid_at', { ascending: true })

  const weeklyMap = new Map<string, number>()
  for (const p of recentPayments || []) {
    const d = new Date(p.paid_at)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().split('T')[0]
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + Number(p.amount))
  }
  const weeklyCollection = Array.from(weeklyMap.entries())
    .map(([week, total]) => ({ week, total }))
    .sort((a, b) => a.week.localeCompare(b.week))

  return {
    batchAttendance,
    defaulterList,
    overdueCount,
    totalOutstanding,
    batchPerformance,
    weeklyCollection,
    today,
  }
}
