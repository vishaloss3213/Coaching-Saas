'use client'

import { useActionState } from 'react'
import { removeStudent } from '@/lib/student-batches/actions'

export function EnrolledStudentRow({ batchId, studentId }: { batchId: string; studentId: string }) {
  const action = async (_prev: { error: string } | null) => {
    const confirmed = window.confirm('Remove this student from the batch?')
    if (!confirmed) return null
    return removeStudent(batchId, studentId)
  }
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="inline">
      <button type="submit" className="text-sm text-red-500 hover:text-red-700">
        Remove
      </button>
      {(state as any)?.error && (
        <span className="ml-2 text-xs text-red-500">{(state as any).error}</span>
      )}
    </form>
  )
}
