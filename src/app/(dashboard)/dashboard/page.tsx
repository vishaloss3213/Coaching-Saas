import Link from 'next/link'
import { getDashboardData } from '@/lib/dashboard/data'
import { redirect } from 'next/navigation'
import { BulkActionSection } from './bulk-actions'

export default async function DashboardPage() {
  const data = await getDashboardData()
  if (!data) redirect('/login')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/students" className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
          <p className="text-sm text-zinc-500">Active students</p>
          <p className="mt-1 text-2xl font-bold">{data.totalStudents}</p>
        </Link>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Pending invoices</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{data.pendingCount}</p>
          <p className="text-xs text-zinc-500">₹{data.totalPendingAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Overdue invoices</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{data.overdueCount}</p>
          <p className="text-xs text-zinc-500">₹{data.totalOverdueAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Total due</p>
          <p className="mt-1 text-2xl font-bold">₹{(data.totalPendingAmount + data.totalOverdueAmount).toLocaleString()}</p>
        </div>
      </div>

      <BulkActionSection overdueInvoices={data.overdueInvoices as any} pendingInvoices={data.pendingInvoices as any} today={data.today} />
    </div>
  )
}
