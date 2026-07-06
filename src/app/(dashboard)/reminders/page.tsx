import Link from 'next/link'
import { getReminderRules, deleteReminderRule } from '@/lib/reminders/actions'
import { DeleteClientButton } from '@/app/(dashboard)/fee-plans/components/delete-button'

export default async function RemindersPage() {
  const rules = await getReminderRules()

  const triggerLabels: Record<string, string> = { fee_due: 'Fee due', fee_overdue: 'Fee overdue', attendance_gap: 'Attendance gap', custom: 'Custom' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reminder Rules</h1>
        <Link href="/reminders/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          New rule
        </Link>
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-zinc-500">No reminder rules yet. <Link href="/reminders/new" className="underline">Create one</Link>.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Trigger</th>
                <th className="px-4 py-3 text-left font-medium">Offset (days)</th>
                <th className="px-4 py-3 text-left font-medium">Channel</th>
                <th className="px-4 py-3 text-left font-medium">Template</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium capitalize">{triggerLabels[r.trigger_type] || r.trigger_type}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.offset_days >= 0 ? `${r.offset_days} day(s) before` : `${Math.abs(r.offset_days)} day(s) after`}</td>
                  <td className="px-4 py-3 capitalize text-zinc-500">{r.channel}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.template_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${r.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {r.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/reminders/${r.id}/edit`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Edit</Link>
                      <DeleteClientButton id={r.id} onDelete={deleteReminderRule} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
