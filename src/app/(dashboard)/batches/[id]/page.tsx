import Link from 'next/link'
import { getBatchWithStudents } from '@/lib/student-batches/actions'
import { EnrolledStudentRow } from './components/enrolled-student-row'

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { batch, enrolled } = await getBatchWithStudents(id)

  const capacityUsed = enrolled.length
  const capacityTotal = batch.capacity

  return (
    <div className="space-y-6">
      <div>
        <Link href="/batches" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to batches
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{batch.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {batch.subject && `${batch.subject} · `}
              {(batch as any).teachers?.full_name || 'No teacher assigned'}
            </p>
            <p className="text-sm text-zinc-500">
              {batch.schedule_text && `${batch.schedule_text} · `}
              {batch.start_time?.slice(0, 5)}-{batch.end_time?.slice(0, 5)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                batch.active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {batch.active ? 'Active' : 'Inactive'}
            </span>
            {capacityTotal && (
              <p className="mt-2 text-xs text-zinc-500">
                Capacity: {capacityUsed}/{capacityTotal}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Enrolled students ({enrolled.length})
        </h2>
        <div className="flex gap-2">
          <Link
            href={`/batches/${id}/generate-invoices`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Generate invoices
          </Link>
          <Link
            href={`/batches/${id}/enroll`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Enroll students
          </Link>
        </div>
      </div>

      {enrolled.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No students enrolled yet.{' '}
          <Link href={`/batches/${id}/enroll`} className="underline">
            Enroll students
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Student</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Enrolled</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {enrolled.map((e) => {
                const student = e.students as any
                return (
                  <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium">{student.full_name}</td>
                    <td className="px-4 py-3 text-zinc-500">{student.phone || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(e.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <EnrolledStudentRow batchId={id} studentId={student.id} />
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
