import Link from 'next/link'
import { getSessions } from '@/lib/attendance/actions'

export default async function AttendancePage() {
  const sessions = await getSessions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Link
          href="/attendance/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No sessions yet.{' '}
          <Link href="/attendance/new" className="underline">
            Take attendance
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Batch</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Mode</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sessions.map((s) => {
                const batch = s.batches as any
                return (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium">
                      {new Date(s.session_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {batch?.name}{batch?.subject ? ` (${batch.subject})` : ''}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {s.start_time?.slice(0, 5) || '—'}
                      {s.end_time ? `-${s.end_time.slice(0, 5)}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                        {s.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/attendance/${s.id}`}
                        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
