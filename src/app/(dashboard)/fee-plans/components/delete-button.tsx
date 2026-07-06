'use client'

import { useActionState } from 'react'

export function DeleteClientButton({ id, onDelete }: { id: string; onDelete: (id: string) => Promise<{ error: string } | null> }) {
  const [state, formAction] = useActionState(async () => {
    if (!window.confirm('Delete this item?')) return null
    return onDelete(id)
  }, null)

  return (
    <form action={formAction} className="inline">
      <button type="submit" className="text-sm text-red-500 hover:text-red-700">Delete</button>
      {(state as any)?.error && <span className="ml-2 text-xs text-red-500">{(state as any).error}</span>}
    </form>
  )
}
