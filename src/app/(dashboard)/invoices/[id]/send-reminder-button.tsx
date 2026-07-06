'use client'

import { useActionState } from 'react'
import { sendRemindersForInvoice } from '@/lib/reminders/send'

export function SendReminderButton({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState(async () => sendRemindersForInvoice(invoiceId), null)

  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
        {pending ? 'Sending...' : 'Send reminder'}
      </button>
      {state?.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
    </form>
  )
}
