import { getReportsData } from '@/lib/reports/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ReportsPage() {
  const data = await getReportsData()
  if (!data) redirect('/login')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Absent (30 days)</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{data.absentees.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Pending invoices</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{data.pendingInvoices.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Total pending</p>
          <p className="mt-1 text-2xl font-bold">₹{data.pendingTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Absentees */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Absentees (last 30 days)</h2>
        {data.absentees.length === 0 ? (
          <p className="text-sm text-zinc-500">No absences recorded in the last 30 days.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Parent</th>
                  <th className="px-4 py-3 text-left font-medium">Absences</th>
                  <th className="px-4 py-3 text-left font-medium">Batches</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.absentees.map((a, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium">{a.student?.full_name}</td>
                    <td className="px-4 py-3 text-zinc-500">{a.student?.phone || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{a.student?.parent_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{a.count}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{Array.from(a.batches).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/communication?student=${a.student?.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Alert</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly collection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Monthly collection</h2>
        {data.monthlyCollection.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Month</th>
                  <th className="px-4 py-3 text-right font-medium">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.monthlyCollection.map((m) => (
                  <tr key={m.month} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium">{new Date(m.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">₹{m.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200 bg-zinc-50 font-semibold dark:border-zinc-800 dark:bg-zinc-900">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">₹{data.monthlyCollection.reduce((s, m) => s + m.total, 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending fees */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Pending fees</h2>
        {data.pendingInvoices.length === 0 ? (
          <p className="text-sm text-zinc-500">No pending invoices.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.pendingInvoices.map((inv: any) => {
                  const bal = inv.amount_due - inv.amount_paid
                  const isOverdue = inv.due_date < data.today
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-medium">{inv.students?.full_name}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.fee_plans?.name}</td>
                      <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-zinc-500'}`}>{inv.due_date}</td>
                      <td className="px-4 py-3">₹{inv.amount_due.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold">₹{bal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${inv.status === 'overdue' || isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} dark:bg-red-900/30 dark:text-red-400`}>{isOverdue && inv.status !== 'overdue' ? 'overdue' : inv.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
