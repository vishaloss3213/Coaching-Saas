'use client'

import { useActionState } from 'react'
import { createBatch, updateBatch } from '@/lib/batches/actions'

type Teacher = { id: string; full_name: string }
type Batch = {
  id: string
  name: string
  subject: string | null
  teacher_id: string | null
  schedule_text: string | null
  start_time: string | null
  end_time: string | null
  capacity: number | null
  active: boolean
}

type Props = { teachers: Teacher[]; batch?: Batch }

export function BatchForm({ teachers, batch }: Props) {
  const wrappedAction = async (_prev: { error: string } | null, formData: FormData) => {
    if (batch) return updateBatch(batch.id, _prev, formData)
    return createBatch(_prev, formData)
  }

  const [state, formAction, pending] = useActionState(wrappedAction, null)

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Batch name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={batch?.name}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={batch?.subject || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="teacher_id" className="block text-sm font-medium mb-1">
            Teacher
          </label>
          <select
            id="teacher_id"
            name="teacher_id"
            defaultValue={batch?.teacher_id || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="schedule_text" className="block text-sm font-medium mb-1">
          Schedule (e.g. Mon/Wed/Fri 4-5pm)
        </label>
        <input
          id="schedule_text"
          name="schedule_text"
          type="text"
          placeholder="e.g. Mon/Wed/Fri 4:00-5:00pm"
          defaultValue={batch?.schedule_text || ''}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium mb-1">
            Start time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue={batch?.start_time || ''}
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
            defaultValue={batch?.end_time || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium mb-1">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            defaultValue={batch?.capacity || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              name="active"
              type="checkbox"
              defaultChecked={batch?.active ?? true}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Saving...' : batch ? 'Update batch' : 'Create batch'}
        </button>
        <a
          href="/batches"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
