import Link from 'next/link'
import { getSession } from '@/lib/attendance/actions'
import { StatusBadge } from '../components/status-badge'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, records } = await getSession(id)
  const batch = session.batches as any

  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/attendance" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to attendance
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h1 className="text-xl font-bold">
          {batch?.name} — {new Date(session.session_date).toLocaleDateString()}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {session.start_time?.slice(0, 5)}{session.end_time ? ` - ${session.end_time.slice(0, 5)}` : ''}
          {session.mode === 'online' ? ' · Online' : ' · Offline'}
        </p>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="rounded-lg bg-green-50 px-3 py-2 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Present: {summary.present}
        </div>
        <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Absent: {summary.absent}
        </div>
        <div className="rounded-lg bg-yellow-50 px-3 py-2 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Late: {summary.late}
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          Excused: {summary.excused}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {records.map((r) => {
              const student = r.students as any
              return (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">{student.full_name}</td>
                  <td className="px-4 py-3 text-zinc-500">{student.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
