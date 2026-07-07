import { getInvoiceReceipt } from '@/lib/invoices/actions'
import { notFound } from 'next/navigation'
import { PrintButton } from './print-button'

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getInvoiceReceipt(id)
  if (!data) notFound()

  const { invoice, payments, center } = data
  const balance = invoice.amount_due - invoice.amount_paid

  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div id="receipt" className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm print:border-none print:shadow-none dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 pb-6 text-center dark:border-zinc-800">
          <h1 className="text-xl font-bold">{center?.name || 'Coaching Center'}</h1>
          {center?.address && <p className="mt-1 text-sm text-zinc-500">{center.address}</p>}
          {center?.phone && <p className="text-sm text-zinc-500">Phone: {center.phone}</p>}
          {center?.email && <p className="text-sm text-zinc-500">Email: {center.email}</p>}
        </div>

        <div className="py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payment Receipt</h2>
            <p className="text-sm text-zinc-500">Invoice #{invoice.id.slice(0, 8)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">Student</p>
              <p className="font-medium">{invoice.students?.full_name}</p>
              {invoice.students?.phone && <p className="text-zinc-500">{invoice.students.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-zinc-500">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-zinc-500">Parent</p>
              <p className="font-medium">{invoice.students?.parent_name || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500">Plan</p>
              <p className="font-medium capitalize">{invoice.fee_plans?.name} ({invoice.fee_plans?.cycle_type})</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
            <p><span className="text-zinc-500">Period:</span> {invoice.period_start} — {invoice.period_end}</p>
            <p><span className="text-zinc-500">Due date:</span> {invoice.due_date}</p>
          </div>
        </div>

        <div className="border-t border-zinc-200 py-4 dark:border-zinc-800">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Payments</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-zinc-500">No payments recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-2 text-left font-medium text-zinc-500">Date</th>
                  <th className="pb-2 text-left font-medium text-zinc-500">Method</th>
                  <th className="pb-2 text-left font-medium text-zinc-500">Reference</th>
                  <th className="pb-2 text-right font-medium text-zinc-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-2">{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className="py-2 capitalize">{p.method}</td>
                    <td className="py-2">{p.reference || '—'}</td>
                    <td className="py-2 text-right font-medium">₹{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Amount due</span>
            <span>₹{invoice.amount_due.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Total paid</span>
            <span className="text-green-600">₹{invoice.amount_paid.toLocaleString()}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-zinc-200 pt-1 text-base font-bold dark:border-zinc-800">
            <span>Balance</span>
            <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>₹{balance.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
          <p>Thank you for your payment</p>
          <p className="mt-1">This is a computer-generated receipt</p>
        </div>
      </div>
    </div>
  )
}
