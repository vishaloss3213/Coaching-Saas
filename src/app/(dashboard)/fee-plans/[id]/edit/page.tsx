import Link from 'next/link'
import { getFeePlan } from '@/lib/fees/actions'
import { FeePlanForm } from '../../components/fee-plan-form'

export default async function EditFeePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await getFeePlan(id)
  return (
    <div className="space-y-6">
      <div><Link href="/fee-plans" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to fee plans</Link><h1 className="mt-2 text-2xl font-bold">Edit fee plan</h1></div>
      <FeePlanForm plan={plan} />
    </div>
  )
}
