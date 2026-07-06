import { getBatchesWithStudents } from '@/lib/communication/actions'
import { redirect } from 'next/navigation'
import { BatchUpdateForm } from './batch-update-form'
import { ParentAlertForm } from './parent-alert-form'
import { PerformanceNoteForm } from './performance-note-form'
import { QuickActionButton } from './quick-action-button'

export default async function CommunicationPage({ searchParams }: { searchParams: Promise<{ student?: string; tab?: string }> }) {
  const { student, tab } = await searchParams
  const { batches, students } = await getBatchesWithStudents()
  if (!batches) redirect('/login')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Communication</h1>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-900/10">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Send daily summary</p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">Today's attendance + fee status to owner</p>
          <div className="mt-3"><QuickActionButton action="summary" label="Send summary" /></div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-900/10">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Alert defaulters</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">Send fee reminders to all overdue parents</p>
          <div className="mt-3"><QuickActionButton action="defaulters" label="Send alerts" /></div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-900/10">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Batch performance note</p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Share progress update with batch parents</p>
        </div>
      </div>

      {/* Forms grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">Batch performance note</h2>
          <p className="mb-4 text-xs text-zinc-400">Write a progress note and send to all parents in a batch.</p>
          <PerformanceNoteForm batches={batches} />
        </div>

        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">Batch update</h2>
          <p className="mb-4 text-xs text-zinc-400">Send a custom message to all students/parents in a batch.</p>
          <BatchUpdateForm batches={batches} />
        </div>

        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">Parent alert</h2>
          <p className="mb-4 text-xs text-zinc-400">Select individual students and send a message to their parents.</p>
          <ParentAlertForm students={students} preselectedId={student} />
        </div>
      </div>

      {/* Log note */}
      <div className="rounded-xl border border-zinc-200 p-5 text-sm text-zinc-500 dark:border-zinc-800">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">About message delivery</p>
        <p className="mt-1">All messages are logged in the system. A real provider (Twilio, Gupshup, email API) can be connected to deliver them. The log serves as a record of all communications sent.</p>
      </div>
    </div>
  )
}
