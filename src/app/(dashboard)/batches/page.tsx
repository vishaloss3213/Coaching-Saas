import Link from 'next/link'
import { getBatches } from '@/lib/batches/actions'
import { DeleteBatchButton } from './components/delete-button'

export default async function BatchesPage() {
  const batches = await getBatches()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Link
          href="/batches/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create batch
        </Link>
      </div>

      {batches.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No batches yet.{' '}
          <Link href="/batches/new" className="underline">
            Create your first batch
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Subject</th>
                <th className="px-4 py-3 text-left font-medium">Teacher</th>
                <th className="px-4 py-3 text-left font-medium">Schedule</th>
                <th className="px-4 py-3 text-left font-medium">Capacity</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/batches/${b.id}`} className="hover:underline">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{b.subject || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {(b as any).teachers?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{b.schedule_text || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{b.capacity || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {b.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/batches/${b.id}/edit`}
                        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteBatchButton batchId={b.id} />
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
