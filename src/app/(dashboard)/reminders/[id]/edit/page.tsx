import Link from 'next/link'
import { getReminderRule } from '@/lib/reminders/actions'
import { ReminderRuleForm } from '../../components/reminder-rule-form'

export default async function EditReminderRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await getReminderRule(id)
  return (
    <div className="space-y-6">
      <div><Link href="/reminders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to reminders</Link><h1 className="mt-2 text-2xl font-bold">Edit reminder rule</h1></div>
      <ReminderRuleForm rule={rule} />
    </div>
  )
}
