import Link from 'next/link'
import { getDashboardData } from '@/lib/dashboard/data'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const data = await getDashboardData()
  if (!data) redirect('/login')

  const daysOverdue = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
    return diff > 0 ? diff : 0
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Active students</p>
          <p className="mt-1 text-2xl font-bold">{data.totalStudents}</p>
        </div>
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

      {data.overdueInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-600">Overdue ({data.overdueCount})</h2>
          <div className="overflow-x-auto rounded-xl border border-red-200 dark:border-red-900">
            <table className="w-full text-sm">
              <thead className="bg-red-50 dark:bg-red-900/20">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Overdue</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Paid</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                {data.overdueInvoices.map((inv) => {
                  const bal = inv.amount_due - inv.amount_paid
                  return (
                    <tr key={inv.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                      <td className="px-4 py-3 font-medium">{inv.students?.full_name}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.fee_plans?.name}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.due_date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{daysOverdue(inv.due_date)}d</span>
                      </td>
                      <td className="px-4 py-3">₹{inv.amount_due.toLocaleString()}</td>
                      <td className="px-4 py-3">₹{inv.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">₹{bal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.pendingInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending ({data.pendingCount})</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Paid</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.pendingInvoices.map((inv) => {
                  const bal = inv.amount_due - inv.amount_paid
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-medium">{inv.students?.full_name}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.fee_plans?.name}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.due_date}</td>
                      <td className="px-4 py-3">₹{inv.amount_due.toLocaleString()}</td>
                      <td className="px-4 py-3">₹{inv.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold">₹{bal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.pendingCount === 0 && data.overdueCount === 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-900/10">
          <p className="text-lg font-medium text-green-700 dark:text-green-400">All clear!</p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-500">No pending or overdue invoices.</p>
        </div>
      )}
    </div>
  )
}
