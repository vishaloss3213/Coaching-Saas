'use client'

import { useActionState } from 'react'
import { sendDailySummary } from '@/lib/communication/actions'

type BatchSum = { name: string; present: number; absent: number; enrolledCount: number; attendancePct: number | null }

export function SendSummaryButton({ data }: { data: { batchAttendance: BatchSum[]; overdueCount: number; totalOutstanding: number; totalAbsentToday: number; totalPresentToday: number; totalEnrolled: number; today: string } }) {
  const [state, action, pending] = useActionState(async () => {
    const lines = data.batchAttendance.map((b) => {
      const pct = b.attendancePct !== null ? `${b.attendancePct}%` : 'No session'
      return `${b.name}: ${b.present}/${b.enrolledCount} (${pct})${b.absent > 0 ? `, ${b.absent} absent` : ''}`
    })
    const message = [
      `📊 Daily Summary — ${data.today}`,
      '',
      `Attendance: ${data.totalPresentToday}/${data.totalEnrolled} (${data.totalAbsentToday} absent)`,
      ...lines,
      '',
      `Defaulters: ${data.overdueCount} | Outstanding: ₹${data.totalOutstanding.toLocaleString()}`,
    ].join('\n')
    return sendDailySummary(message)
  }, null)

  return (
    <form action={action}>
      {state?.success && <p className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">{state.success}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
        {pending ? 'Sending...' : 'Share summary'}
      </button>
    </form>
  )
}
