'use client'

import { useActionState } from 'react'
import { generateInvoices } from '@/lib/invoices/actions'
import { StudentSelect } from './student-select'

type Props = {
  students: Array<{ id: string; full_name: string }>
  plans: Array<{ id: string; name: string; cycle_type: string; amount: number }>
  batches: Array<{ id: string; name: string }>
}

export function GenerateInvoiceForm({ students, plans, batches }: Props) {
  const [state, action, pending] = useActionState(generateInvoices, null)

  return (
    <form action={action} className="max-w-lg space-y-4">
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}

      <div>
        <label htmlFor="fee_plan_id" className="block text-sm font-medium mb-1">Fee plan <span className="text-red-500">*</span></label>
        <select id="fee_plan_id" name="fee_plan_id" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900">
          <option value="">Select plan</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.amount}/{p.cycle_type}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="period_start" className="block text-sm font-medium mb-1">Period start date <span className="text-red-500">*</span></label>
        <input id="period_start" name="period_start" type="date" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>

      <StudentSelect students={students} batches={batches} />

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? 'Generating...' : 'Generate invoices'}
        </button>
        <a href="/invoices" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</a>
      </div>
    </form>
  )
}
