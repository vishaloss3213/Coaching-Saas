import Link from 'next/link'
import { getTeachers } from '@/lib/batches/actions'
import { BatchForm } from '../components/batch-form'

export default async function NewBatchPage() {
  const teachers = await getTeachers()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/batches" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to batches
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Create batch</h1>
      </div>
      <BatchForm teachers={teachers} />
    </div>
  )
}
