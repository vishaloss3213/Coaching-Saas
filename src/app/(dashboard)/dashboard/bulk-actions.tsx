'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bulkMarkOverdue, bulkSendReminders } from '@/lib/invoices/bulk-actions'

type Invoice = { id: string; students: { full_name: string } | null; fee_plans: { name: string } | null; due_date: string; amount_due: number; amount_paid: number; status: string }

export function BulkActionSection({ overdueInvoices, pendingInvoices, today }: { overdueInvoices: Invoice[]; pendingInvoices: Invoice[]; today: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const allInvoices = [...overdueInvoices, ...pendingInvoices]
  const allIds = allInvoices.map((i) => i.id)
  const allSelected = selected.size === allInvoices.length && allInvoices.length > 0

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  async function handle(action: 'overdue' | 'remind') {
    setLoading(true)
    setError('')
    const ids = Array.from(selected)
    const result = action === 'overdue' ? await bulkMarkOverdue(ids) : await bulkSendReminders(ids)
    if (result?.error) setError(result.error)
    else setSelected(new Set())
    setLoading(false)
    router.refresh()
  }

  const todayMs = new Date(today).getTime()
  const daysOverdue = (d: string) => Math.max(0, Math.floor((todayMs - new Date(d).getTime()) / 86400000))

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>}

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={() => handle('remind')} disabled={loading} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            {loading ? 'Processing...' : 'Send reminders'}
          </button>
          <button onClick={() => handle('overdue')} disabled={loading} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
            Mark overdue
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Clear</button>
        </div>
      )}

      {overdueInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-600">Overdue ({overdueInvoices.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-red-200 dark:border-red-900">
            <table className="w-full text-sm">
              <thead className="bg-red-50 dark:bg-red-900/20">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={overdueInvoices.every((i) => selected.has(i.id))} onChange={() => {
                      const ids = overdueInvoices.map((i) => i.id)
                      const all = ids.every((id) => selected.has(id))
                      const next = new Set(selected)
                      ids.forEach((id) => { if (all) next.delete(id); else next.add(id) })
                      setSelected(next)
                    }} className="rounded border-zinc-300 dark:border-zinc-700" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Overdue</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggle(inv.id)} className="rounded border-zinc-300 dark:border-zinc-700" />
                    </td>
                    <td className="px-4 py-3 font-medium">{inv.students?.full_name}</td>
                    <td className="px-4 py-3 text-zinc-500">{inv.fee_plans?.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{inv.due_date}</td>
                    <td className="px-4 py-3"><span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{daysOverdue(inv.due_date)}d</span></td>
                    <td className="px-4 py-3 font-semibold text-red-600">₹{(inv.amount_due - inv.amount_paid).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending ({pendingInvoices.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={pendingInvoices.every((i) => selected.has(i.id))} onChange={() => {
                      const ids = pendingInvoices.map((i) => i.id)
                      const all = ids.every((id) => selected.has(id))
                      const next = new Set(selected)
                      ids.forEach((id) => { if (all) next.delete(id); else next.add(id) })
                      setSelected(next)
                    }} className="rounded border-zinc-300 dark:border-zinc-700" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Due date</th>
                  <th className="px-4 py-3 text-left font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {pendingInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggle(inv.id)} className="rounded border-zinc-300 dark:border-zinc-700" />
                    </td>
                    <td className="px-4 py-3 font-medium">{inv.students?.full_name}</td>
                    <td className="px-4 py-3 text-zinc-500">{inv.fee_plans?.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{inv.due_date}</td>
                    <td className="px-4 py-3 font-semibold">₹{(inv.amount_due - inv.amount_paid).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/invoices/${inv.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingInvoices.length === 0 && overdueInvoices.length === 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-900/10">
          <p className="text-lg font-medium text-green-700 dark:text-green-400">All clear!</p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-500">No pending or overdue invoices.</p>
        </div>
      )}
    </div>
  )
}
