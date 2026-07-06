import Link from 'next/link'
import { getAvailableStudents } from '@/lib/student-batches/actions'
import { EnrollForm } from './components/enroll-form'

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const students = await getAvailableStudents(id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/batches/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          &larr; Back to batch
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Enroll students</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Select students to add to this batch. Only active students not already enrolled are shown.
        </p>
      </div>

      <EnrollForm batchId={id} students={students} />
    </div>
  )
}
