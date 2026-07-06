'use client'

import { useActionState } from 'react'
import { recordPayment } from '@/lib/invoices/actions'

export function PaymentForm({ invoiceId, studentId, balance }: { invoiceId: string; studentId: string; balance: number }) {
  const [state, action, pending] = useActionState(recordPayment, null)

  return (
    <form action={action} className="max-w-md space-y-3">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      <input type="hidden" name="student_id" value={studentId} />
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (max ₹{balance.toLocaleString()}) <span className="text-red-500">*</span></label>
        <input id="amount" name="amount" type="number" step="0.01" min="1" max={balance} required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="method" className="block text-sm font-medium mb-1">Method</label>
          <select id="method" name="method" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label htmlFor="reference" className="block text-sm font-medium mb-1">Reference</label>
          <input id="reference" name="reference" type="text" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        {pending ? 'Recording...' : 'Record payment'}
      </button>
    </form>
  )
}
