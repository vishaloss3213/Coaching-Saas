'use client'

import { useActionState } from 'react'
import { deleteStudent } from '@/lib/students/actions'

export function DeleteButton({ studentId }: { studentId: string }) {
  const action = async (_prev: { error: string } | null, formData: FormData) => {
    const confirmed = window.confirm('Delete this student?')
    if (!confirmed) return { error: '' }
    return deleteStudent(studentId)
  }
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="inline">
      <button type="submit" className="text-sm text-red-500 hover:text-red-700">
        Delete
      </button>
      {state?.error && state.error !== '' && (
        <span className="ml-2 text-xs text-red-500">{state.error}</span>
      )}
    </form>
  )
}
