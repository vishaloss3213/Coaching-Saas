'use client'

import { useActionState, useState } from 'react'
import { sendParentAlert } from '@/lib/communication/actions'

export function ParentAlertForm({ students, preselectedId }: { students: Array<{ id: string; full_name: string; parent_name: string | null; phone: string | null }>; preselectedId?: string }) {
  const [state, action, pending] = useActionState(sendParentAlert, null)
  const [selected, setSelected] = useState<Set<string>>(() => preselectedId ? new Set([preselectedId]) : new Set())

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  return (
    <form action={action} className="space-y-4">
      {state?.success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">{state.success}</p>}
      {state?.error && !state.success && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}

      <input type="hidden" name="student_ids" value="" />
      {Array.from(selected).map((id) => <input key={id} type="hidden" name="student_ids" value={id} />)}

      <div>
        <label className="block text-sm font-medium mb-1">Channel</label>
        <select name="channel" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Select students ({selected.size} selected)</label>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          {students.map((s) => (
            <label key={s.id} className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${selected.has(s.id) ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}>
              <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="rounded border-zinc-300 dark:border-zinc-700" />
              <span>{s.full_name}</span>
              {s.parent_name && <span className="text-xs text-zinc-400">({s.parent_name})</span>}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Message <span className="text-red-500">*</span></label>
        <textarea name="message" rows={4} required placeholder="Type your alert message here..." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
      </div>

      <button type="submit" disabled={pending || selected.size === 0} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        {pending ? 'Sending...' : `Send to ${selected.size} student(s)`}
      </button>
    </form>
  )
}
