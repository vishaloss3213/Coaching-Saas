'use client'

import { useActionState } from 'react'
import { quickSendDailySummary, sendDefaulterAlerts } from '@/lib/communication/actions'

export function QuickActionButton({ action, label }: { action: 'summary' | 'defaulters'; label: string }) {
  const fn = action === 'summary' ? quickSendDailySummary : sendDefaulterAlerts
  const [state, formAction, pending] = useActionState(fn, null)

  return (
    <form action={formAction}>
      {state?.success && <p className="mb-2 text-xs text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        {pending ? 'Sending...' : label}
      </button>
    </form>
  )
}
