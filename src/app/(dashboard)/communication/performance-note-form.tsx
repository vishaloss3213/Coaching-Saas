'use client'

import { useActionState, useState } from 'react'
import { sendBatchPerformanceNote } from '@/lib/communication/actions'

export function PerformanceNoteForm({ batches }: { batches: Array<{ id: string; name: string }> }) {
  const [state, action, pending] = useActionState(sendBatchPerformanceNote, null)
  const [batchId, setBatchId] = useState('')

  return (
    <form action={action} className="space-y-4">
      {state?.success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">{state.success}</p>}
      {state?.error && !state.success && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Batch <span className="text-red-500">*</span></label>
        <select name="batch_id" required value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="">Select batch</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Performance note <span className="text-red-500">*</span></label>
        <textarea name="note" rows={3} required placeholder="e.g. Good progress this week. Practice topics covered: Algebra, Geometry. Homework pending for 3 students." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>

      <button type="submit" disabled={pending || !batchId} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        {pending ? 'Sending...' : 'Send performance note'}
      </button>
    </form>
  )
}
