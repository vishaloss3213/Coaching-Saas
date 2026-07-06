import Link from 'next/link'
import { getBatch, getTeachers } from '@/lib/batches/actions'
import { BatchForm } from '../../components/batch-form'

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [batch, teachers] = await Promise.all([getBatch(id), getTeachers()])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/batches" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to batches
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit batch</h1>
      </div>
      <BatchForm teachers={teachers} batch={batch} />
    </div>
  )
}
