'use client'

import { useActionState } from 'react'
import { deleteBatch } from '@/lib/batches/actions'

export function DeleteBatchButton({ batchId }: { batchId: string }) {
  const action = async (_prev: { error: string } | null) => {
    const confirmed = window.confirm('Delete this batch? This cannot be undone.')
    if (!confirmed) return { error: '' }
    return deleteBatch(batchId)
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
