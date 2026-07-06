'use client'

import { useActionState } from 'react'
import { createFeePlan, updateFeePlan } from '@/lib/fees/actions'

type FeePlan = { id: string; name: string; amount: number; cycle_type: string; due_day: number | null; active: boolean }

export function FeePlanForm({ plan }: { plan?: FeePlan }) {
  const wrapped = async (_prev: { error: string } | null, fd: FormData) =>
    plan ? updateFeePlan(plan.id, _prev, fd) : createFeePlan(_prev, fd)
  const [state, action, pending] = useActionState(wrapped, null)

  return (
    <form action={action} className="max-w-lg space-y-4">
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Plan name <span className="text-red-500">*</span></label>
        <input id="name" name="name" type="text" required defaultValue={plan?.name} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (₹) <span className="text-red-500">*</span></label>
          <input id="amount" name="amount" type="number" step="0.01" min="1" required defaultValue={plan?.amount} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
        <div>
          <label htmlFor="cycle_type" className="block text-sm font-medium mb-1">Cycle <span className="text-red-500">*</span></label>
          <select id="cycle_type" name="cycle_type" required defaultValue={plan?.cycle_type || 'monthly'} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="due_day" className="block text-sm font-medium mb-1">Due day of month</label>
          <input id="due_day" name="due_day" type="number" min="1" max="31" defaultValue={plan?.due_day || ''} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input name="active" type="checkbox" defaultChecked={plan?.active ?? true} className="rounded border-zinc-300 dark:border-zinc-700" /> Active
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? 'Saving...' : plan ? 'Update plan' : 'Create plan'}
        </button>
        <a href="/fee-plans" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</a>
      </div>
    </form>
  )
}
