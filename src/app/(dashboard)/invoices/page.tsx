import Link from 'next/link'
import { getInvoices } from '@/lib/invoices/actions'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  const statusStyle = (s: string) => {
    switch (s) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          Generate invoices
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-sm text-zinc-500">No invoices yet. <Link href="/invoices/new" className="underline">Generate one</Link>.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Student</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-left font-medium">Period</th>
                <th className="px-4 py-3 text-left font-medium">Due</th>
                <th className="px-4 py-3 text-left font-medium">Paid</th>
                <th className="px-4 py-3 text-left font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">{inv.students?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3">{inv.fee_plans?.name || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{inv.period_start} — {inv.period_end}</td>
                  <td className="px-4 py-3">₹{inv.amount_due.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{inv.amount_paid.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">₹{(inv.amount_due - inv.amount_paid).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
