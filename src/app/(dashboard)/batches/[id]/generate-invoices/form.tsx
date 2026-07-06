'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { generateBatchInvoices } from '@/lib/invoices/actions'

type Student = { id: string; full_name: string; phone: string | null }
type Plan = { id: string; name: string; cycle_type: string; amount: number }

export function BatchInvoiceForm({ batchId, students, plans }: { batchId: string; students: Student[]; plans: Plan[] }) {
  const [state, action, pending] = useActionState(generateBatchInvoices, null)

  return (
    <form action={action} className="max-w-lg space-y-4">
      <input type="hidden" name="batch_id" value={batchId} />

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}

      <div>
        <label htmlFor="fee_plan_id" className="block text-sm font-medium mb-1">Fee plan <span className="text-red-500">*</span></label>
        {plans.length === 0 ? (
          <p className="text-sm text-zinc-500">No active fee plans. <Link href="/fee-plans/new" className="underline">Create one</Link>.</p>
        ) : (
          <select id="fee_plan_id" name="fee_plan_id" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Select plan</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.amount}/{p.cycle_type}</option>)}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="period_start" className="block text-sm font-medium mb-1">Period start date <span className="text-red-500">*</span></label>
        <input id="period_start" name="period_start" type="date" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium mb-2">Students to invoice ({students.length})</p>
        {students.length === 0 ? (
          <p className="text-sm text-zinc-500">No active students enrolled in this batch.</p>
        ) : (
          <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-zinc-600 dark:text-zinc-400">
            {students.map((s) => <li key={s.id}>{s.full_name}{s.phone ? ` (${s.phone})` : ''}</li>)}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending || plans.length === 0 || students.length === 0} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? 'Generating...' : `Generate ${students.length} invoice(s)`}
        </button>
        <a href={`/batches/${batchId}`} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</a>
      </div>
    </form>
  )
}
