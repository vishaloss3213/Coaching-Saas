'use client'

import { useActionState } from 'react'
import { enrollStudents } from '@/lib/student-batches/actions'
import Link from 'next/link'

export function EnrollForm({
  batchId,
  students,
}: {
  batchId: string
  students: { id: string; full_name: string; phone: string | null; parent_name: string | null }[]
}) {
  const wrappedAction = async (_prev: { error: string } | null, formData: FormData) =>
    enrollStudents(batchId, _prev, formData)

  const [state, formAction, pending] = useActionState(wrappedAction, null)

  if (students.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-500">All active students are already enrolled in this batch.</p>
        <Link
          href={`/batches/${batchId}`}
          className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
        >
          &larr; Back to batch
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        {students.map((s) => (
          <label
            key={s.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
          >
            <input
              type="checkbox"
              name="student_ids"
              value={s.id}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <div>
              <p className="text-sm font-medium">{s.full_name}</p>
              <p className="text-xs text-zinc-500">
                {s.phone || '—'}
                {s.parent_name && ` · Parent: ${s.parent_name}`}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Enrolling...' : `Enroll selected (${students.length} available)`}
        </button>
        <Link
          href={`/batches/${batchId}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
