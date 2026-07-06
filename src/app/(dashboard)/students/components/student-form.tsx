'use client'

import { useActionState } from 'react'
import { createStudent, updateStudent } from '@/lib/students/actions'

type Props = {
  student?: {
    id: string
    full_name: string
    gender: string | null
    dob: string | null
    phone: string | null
    parent_name: string | null
    parent_phone: string | null
    joining_date: string
    status: string
    notes: string | null
  }
}

export function StudentForm({ student }: Props) {
  const wrappedAction = async (_prev: { error: string } | null, formData: FormData) => {
    if (student) {
      return updateStudent(student.id, _prev, formData)
    }
    return createStudent(_prev, formData)
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
        <label htmlFor="full_name" className="block text-sm font-medium mb-1">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={student?.full_name}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue={student?.gender || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium mb-1">
            Date of birth
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            defaultValue={student?.dob || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={student?.phone || ''}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="parent_name" className="block text-sm font-medium mb-1">
            Parent / Guardian name
          </label>
          <input
            id="parent_name"
            name="parent_name"
            type="text"
            defaultValue={student?.parent_name || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="parent_phone" className="block text-sm font-medium mb-1">
            Parent phone
          </label>
          <input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            defaultValue={student?.parent_phone || ''}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="joining_date" className="block text-sm font-medium mb-1">
            Joining date
          </label>
          <input
            id="joining_date"
            name="joining_date"
            type="date"
            required
            defaultValue={student?.joining_date || new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={student?.status || 'active'}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={student?.notes || ''}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Saving...' : student ? 'Update student' : 'Add student'}
        </button>
        <a
          href="/students"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
