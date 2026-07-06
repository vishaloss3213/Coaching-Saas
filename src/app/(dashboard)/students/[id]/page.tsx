import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudent } from '@/lib/students/actions'
import { getStudentInvoices, getStudentBatches } from '@/lib/students/invoices'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudent(id)
  if (!student) notFound()

  const [invoices, batches] = await Promise.all([
    getStudentInvoices(id),
    getStudentBatches(id),
  ])

  const totalDue = invoices.reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0)

  const statusStyle = (s: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return map[s] || 'bg-zinc-100 text-zinc-600'
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/students" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to students</Link>
        <h1 className="mt-2 text-2xl font-bold">{student.full_name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Details</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500">Phone:</span> {student.phone || '—'}</p>
            <p><span className="text-zinc-500">Parent:</span> {student.parent_name || '—'}{student.parent_phone ? ` (${student.parent_phone})` : ''}</p>
            <p><span className="text-zinc-500">Gender:</span> {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'}</p>
            <p><span className="text-zinc-500">DOB:</span> {student.dob || '—'}</p>
            <p><span className="text-zinc-500">Joined:</span> {new Date(student.joining_date).toLocaleDateString()}</p>
            <p><span className="text-zinc-500">Status:</span> <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>{student.status}</span></p>
            {student.notes && <p><span className="text-zinc-500">Notes:</span> {student.notes}</p>}
          </div>
          <Link href={`/students/${id}/edit`} className="inline-block rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Edit</Link>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Fee Summary</h2>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between"><span className="text-zinc-500">Total invoiced:</span><span className="font-semibold">₹{(totalDue + totalPaid).toLocaleString()}</span></p>
            <p className="flex justify-between"><span className="text-zinc-500">Total paid:</span><span className="font-semibold text-green-600">₹{totalPaid.toLocaleString()}</span></p>
            <p className="flex justify-between border-t border-zinc-200 pt-1 dark:border-zinc-700"><span className="text-zinc-500">Outstanding:</span><span className={`font-semibold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{totalDue.toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {batches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Batches</h2>
          <div className="flex flex-wrap gap-2">
            {batches.map((b: any) => (
              <Link key={b.id} href={`/batches/${b.id}`} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                {b.name}{b.schedule_text ? ` — ${b.schedule_text}` : ''}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Invoices ({invoices.length})</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-zinc-500">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
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
                {invoices.map((inv) => {
                  const bal = inv.amount_due - inv.amount_paid
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-medium">{inv.fee_plans?.name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{inv.period_start} — {inv.period_end}</td>
                      <td className="px-4 py-3">₹{inv.amount_due.toLocaleString()}</td>
                      <td className="px-4 py-3">₹{inv.amount_paid.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold">₹{bal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle(inv.status)}`}>{inv.status}</span>
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
