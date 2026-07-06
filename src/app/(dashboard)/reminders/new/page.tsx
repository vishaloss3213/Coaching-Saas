import Link from 'next/link'
import { ReminderRuleForm } from '../components/reminder-rule-form'

export default function NewReminderRulePage() {
  return (
    <div className="space-y-6">
      <div><Link href="/reminders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">&larr; Back to reminders</Link><h1 className="mt-2 text-2xl font-bold">New reminder rule</h1></div>
      <ReminderRuleForm />
    </div>
  )
}
