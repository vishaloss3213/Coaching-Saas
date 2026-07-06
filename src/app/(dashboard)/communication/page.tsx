import { getBatchesWithStudents } from '@/lib/communication/actions'
import { redirect } from 'next/navigation'
import { BatchUpdateForm } from './batch-update-form'
import { ParentAlertForm } from './parent-alert-form'

export default async function CommunicationPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const { student } = await searchParams
  const { batches, students } = await getBatchesWithStudents()
  if (!batches) redirect('/login')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Communication</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Batch update</h2>
          <p className="mb-4 text-sm text-zinc-500">Send a message to all students in a batch.</p>
          <BatchUpdateForm batches={batches} />
        </div>

        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Parent alert</h2>
          <p className="mb-4 text-sm text-zinc-500">Send a message to selected parents.</p>
          <ParentAlertForm students={students} preselectedId={student} />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 p-5 text-sm text-zinc-500 dark:border-zinc-800">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">Note</p>
        <p className="mt-1">Messages are currently logged in the system. A real messaging provider (WhatsApp API, SMS gateway, or email service) can be connected later to deliver them.</p>
      </div>
    </div>
  )
}
