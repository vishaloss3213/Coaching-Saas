import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) return null

  const centerId = profile.center_id
  const today = new Date().toISOString().split('T')[0]

  const [studentsR, invoicesR] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('center_id', centerId).eq('status', 'active'),
    supabase
      .from('fee_invoices')
      .select('*, students(full_name, phone, parent_name), fee_plans(name, cycle_type, amount)')
      .eq('center_id', centerId)
      .neq('status', 'paid')
      .order('due_date', { ascending: true }),
  ])

  const allUnpaid = invoicesR.data || []
  const pending = allUnpaid.filter((inv) => inv.due_date >= today)
  const overdue = allUnpaid.filter((inv) => inv.due_date < today)

  const pendingAmount = pending.reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0)
  const overdueAmount = overdue.reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0)

  return {
    totalStudents: studentsR.count || 0,
    pendingCount: pending.length,
    overdueCount: overdue.length,
    totalPendingAmount: pendingAmount,
    totalOverdueAmount: overdueAmount,
    pendingInvoices: pending,
    overdueInvoices: overdue,
    today,
  }
}
