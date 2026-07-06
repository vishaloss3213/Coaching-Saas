import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInvoice } from '@/lib/invoices/actions'
import { PaymentForm } from './payment-form'
import { SendReminderButton } from './send-reminder-button'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { invoice, payments } = await getInvoice(id)
  const supabase = await createClient()
  const { data: reminderLogs } = await supabase
    .from('reminder_logs')
    .select('*, reminder_rules(trigger_type, channel)')
    .eq('invoice_id', id)
    .order('sent_at', { ascending: false })

  const statusMap: Record<string, string> = { paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  const statusStyle = statusMap[invoice.status] || 'bg-amber-100 text-amber-700'

  return (
    <div className="space-y-8">
      <div><Link href="/invoices" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to invoices</Link><h1 className="mt-2 text-2xl font-bold">Invoice</h1></div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Details</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500">Student:</span> {invoice.students?.full_name}</p>
            {invoice.students?.phone && <p><span className="text-zinc-500">Phone:</span> {invoice.students.phone}</p>}
            {invoice.students?.parent_name && <p><span className="text-zinc-500">Parent:</span> {invoice.students.parent_name} ({invoice.students.parent_phone})</p>}
            <p><span className="text-zinc-500">Plan:</span> {invoice.fee_plans?.name} ({invoice.fee_plans?.cycle_type})</p>
            <p><span className="text-zinc-500">Period:</span> {invoice.period_start} — {invoice.period_end}</p>
            <p><span className="text-zinc-500">Due date:</span> {invoice.due_date}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Payment Summary</h2>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between"><span className="text-zinc-500">Amount due:</span><span className="font-semibold">₹{invoice.amount_due.toLocaleString()}</span></p>
            <p className="flex justify-between"><span className="text-zinc-500">Amount paid:</span><span className="font-semibold text-green-600">₹{invoice.amount_paid.toLocaleString()}</span></p>
            <p className="flex justify-between border-t border-zinc-200 pt-1 dark:border-zinc-700"><span className="text-zinc-500">Balance:</span><span className={`font-semibold ${invoice.amount_due > invoice.amount_paid ? 'text-red-600' : 'text-green-600'}`}>₹{(invoice.amount_due - invoice.amount_paid).toLocaleString()}</span></p>
          </div>
          <div><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>{invoice.status}</span></div>
        </div>
      </div>

      {invoice.status !== 'paid' && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Record payment</h2>
          <PaymentForm invoiceId={invoice.id} studentId={invoice.student_id} balance={invoice.amount_due - invoice.amount_paid} />
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Reminders</h2>
          <SendReminderButton invoiceId={invoice.id} />
        </div>
        {!reminderLogs || reminderLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">No reminders sent yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Trigger</th>
                  <th className="px-4 py-3 text-left font-medium">Channel</th>
                  <th className="px-4 py-3 text-left font-medium">Sent at</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {reminderLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 capitalize text-zinc-500">{log.reminder_rules?.trigger_type || '—'}</td>
                    <td className="px-4 py-3 capitalize text-zinc-500">{log.channel}</td>
                    <td className="px-4 py-3 text-zinc-500">{log.sent_at}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${log.status === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Payment history</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="px-4 py-3">{pay.paid_at}</td>
                    <td className="px-4 py-3 font-medium">₹{pay.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-zinc-500">{pay.method}</td>
                    <td className="px-4 py-3 text-zinc-500">{pay.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
