'use client'

import { useActionState, useState, useEffect } from 'react'
import { createSession } from '@/lib/attendance/actions'

type Student = { id: string; full_name: string; phone: string | null }
type Batch = { id: string; name: string; subject: string | null }

export function AttendanceForm({ batches }: { batches: Batch[] }) {
  const [state, formAction, pending] = useActionState(createSession, null)
  const [batchId, setBatchId] = useState(batches[0]?.id || '')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!batchId) { setStudents([]); return }
    setLoading(true)
    fetch(`/api/batches/${batchId}/students`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [batchId])

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="batch_id" className="block text-sm font-medium mb-1">
            Batch <span className="text-red-500">*</span>
          </label>
          <select
            id="batch_id"
            name="batch_id"
            required
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="" disabled>
              Select batch
            </option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}{b.subject ? ` (${b.subject})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="session_date" className="block text-sm font-medium mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="session_date"
            name="session_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium mb-1">
            Start time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium mb-1">
            End time
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="mode" className="block text-sm font-medium mb-1">
            Mode
          </label>
          <select
            id="mode"
            name="mode"
            defaultValue="offline"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-zinc-500">Loading students...</p>
      )}

      {!loading && students.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">
            Mark attendance ({students.length} students)
          </h2>
          <div className="space-y-2">
            {students.map((s) => (
              <input key={s.id} type="hidden" name="student_ids" value={s.id} />
            ))}
            {students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium">{s.full_name}</p>
                  <p className="text-xs text-zinc-500">{s.phone || '—'}</p>
                </div>
                <div className="flex gap-1">
                  {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                    <label
                      key={status}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium border transition-colors has-[:checked]:bg-green-100 has-[:checked]:border-green-300 has-[:checked]:text-green-700 dark:has-[:checked]:bg-green-900/30 dark:has-[:checked]:border-green-700 dark:has-[:checked]:text-green-400 border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800`}
                    >
                      <input
                        type="radio"
                        name="statuses"
                        value={status}
                        defaultChecked={i === 0 && status === 'present'}
                        className="sr-only"
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && students.length === 0 && batchId && (
        <p className="text-sm text-zinc-500">
          No students enrolled in this batch.{' '}
          <a href={`/batches/${batchId}`} className="underline">Enroll students</a> first.
        </p>
      )}

      {!loading && !batchId && (
        <p className="text-sm text-zinc-500">Select a batch to see enrolled students.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || loading || students.length === 0}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Saving...' : `Save attendance (${students.length} students)`}
        </button>
        <a
          href="/attendance"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
