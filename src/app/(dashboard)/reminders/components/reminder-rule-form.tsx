'use client'

import { useActionState } from 'react'
import { createReminderRule, updateReminderRule } from '@/lib/reminders/actions'

type Rule = { id: string; trigger_type: string; offset_days: number; channel: string; template_name: string | null; active: boolean }

export function ReminderRuleForm({ rule }: { rule?: Rule }) {
  const wrapped = async (_prev: { error: string } | null, fd: FormData) =>
    rule ? updateReminderRule(rule.id, _prev, fd) : createReminderRule(_prev, fd)
  const [state, action, pending] = useActionState(wrapped, null)

  return (
    <form action={action} className="max-w-lg space-y-4">
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{state.error}</p>}

      <div>
        <label htmlFor="trigger_type" className="block text-sm font-medium mb-1">Trigger <span className="text-red-500">*</span></label>
        <select id="trigger_type" name="trigger_type" required defaultValue={rule?.trigger_type || 'fee_due'} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900">
          <option value="fee_due">Fee due</option>
          <option value="fee_overdue">Fee overdue</option>
          <option value="attendance_gap">Attendance gap</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label htmlFor="offset_days" className="block text-sm font-medium mb-1">Offset (days) <span className="text-red-500">*</span></label>
        <input id="offset_days" name="offset_days" type="number" required defaultValue={rule?.offset_days ?? -0} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900" />
        <p className="mt-1 text-xs text-zinc-500">Positive = days before trigger; Negative = days after trigger</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="channel" className="block text-sm font-medium mb-1">Channel</label>
          <select id="channel" name="channel" defaultValue={rule?.channel || 'whatsapp'} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label htmlFor="template_name" className="block text-sm font-medium mb-1">Template name</label>
          <input id="template_name" name="template_name" type="text" defaultValue={rule?.template_name || ''} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={rule?.active ?? true} className="rounded border-zinc-300 dark:border-zinc-700" /> Active
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? 'Saving...' : rule ? 'Update rule' : 'Create rule'}
        </button>
        <a href="/reminders" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Cancel</a>
      </div>
    </form>
  )
}
