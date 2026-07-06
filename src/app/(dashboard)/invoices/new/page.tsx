import Link from 'next/link'
import { getStudentsAndPlans } from '@/lib/invoices/actions'
import { GenerateInvoiceForm } from '../components/generate-form'

export default async function NewInvoicePage() {
  const { students, plans, batches } = await getStudentsAndPlans()

  return (
    <div className="space-y-6">
      <div><Link href="/invoices" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to invoices</Link><h1 className="mt-2 text-2xl font-bold">Generate invoices</h1></div>
      <GenerateInvoiceForm students={students} plans={plans} batches={batches} />
    </div>
  )
}
