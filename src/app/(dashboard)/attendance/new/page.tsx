import Link from 'next/link'
import { getBatchesForAttendance } from '@/lib/attendance/actions'
import { AttendanceForm } from '../components/attendance-form'

export default async function NewAttendancePage() {
  const batches = await getBatchesForAttendance()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/attendance" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to attendance
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New attendance session</h1>
      </div>
      <AttendanceForm batches={batches} />
    </div>
  )
}
