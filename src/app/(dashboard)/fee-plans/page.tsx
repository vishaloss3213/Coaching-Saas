import Link from 'next/link'
import { getFeePlans, deleteFeePlan } from '@/lib/fees/actions'
import { DeleteClientButton } from './components/delete-button'

export default async function FeePlansPage() {
  const plans = await getFeePlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Plans</h1>
        <Link href="/fee-plans/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          New plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-zinc-500">No fee plans yet. <Link href="/fee-plans/new" className="underline">Create one</Link>.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Cycle</th>
                <th className="px-4 py-3 text-left font-medium">Due day</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize text-zinc-500">{p.cycle_type}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.due_day ? `Day ${p.due_day}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/fee-plans/${p.id}/edit`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Edit</Link>
                      <DeleteClientButton id={p.id} onDelete={deleteFeePlan} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
