import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBatchAndPlans } from '@/lib/invoices/actions'
import { BatchInvoiceForm } from './form'

export default async function BatchGenerateInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { batch, students, plans } = await getBatchAndPlans(id)
  if (!batch) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/batches/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to batch</Link>
        <h1 className="mt-2 text-2xl font-bold">Generate invoices — {batch.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{students.length} active student(s)</p>
      </div>
      <BatchInvoiceForm batchId={id} students={students} plans={plans} />
    </div>
  )
}
