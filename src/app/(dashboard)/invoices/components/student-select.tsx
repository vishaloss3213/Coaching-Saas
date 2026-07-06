'use client'

import { useState, useEffect } from 'react'

export function StudentSelect({ students, batches }: { students: Array<{ id: string; full_name: string }>; batches: Array<{ id: string; name: string }> }) {
  const [batchId, setBatchId] = useState('')
  const [batchStudents, setBatchStudents] = useState<Array<{ id: string; full_name: string }>>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!batchId) { setBatchStudents(students); return }
    setLoading(true)
    fetch(`/api/batches/${batchId}/students`)
      .then((r) => r.json())
      .then((data) => setBatchStudents(data))
      .finally(() => setLoading(false))
  }, [batchId, students])

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  function selectAll() {
    if (selected.size === batchStudents.length) setSelected(new Set())
    else setSelected(new Set(batchStudents.map((s) => s.id)))
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-2">
          {Array.from(selected).map((id) => <input key={id} type="hidden" name="student_ids" value={id} />)}
        </div>
      )}

      <label className="block text-sm font-medium mb-1">Filter by batch</label>
      <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mb-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <option value="">All students</option>
        {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Select students</span>
        <button type="button" onClick={selectAll} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          {selected.size === batchStudents.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading students...</p>
      ) : batchStudents.length === 0 ? (
        <p className="text-sm text-zinc-500">No students found.</p>
      ) : (
        <div className="max-h-60 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          {batchStudents.map((s) => (
            <label key={s.id} className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${selected.has(s.id) ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}>
              <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="rounded border-zinc-300 dark:border-zinc-700" />
              {s.full_name}
            </label>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-zinc-500">{selected.size} student{selected.size !== 1 ? 's' : ''} selected</p>
    </div>
  )
}
