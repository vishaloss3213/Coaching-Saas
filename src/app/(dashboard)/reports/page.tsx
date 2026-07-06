import { getReportsData } from '@/lib/reports/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SendSummaryButton } from './send-summary-button'

export default async function ReportsPage() {
  const data = await getReportsData()
  if (!data) redirect('/login')

  const totalEnrolled = data.batchAttendance.reduce((s, b) => s + b.enrolledCount, 0)
  const totalPresentToday = data.batchAttendance.reduce((s, b) => s + b.present, 0)
  const totalAbsentToday = data.batchAttendance.reduce((s, b) => s + b.absent, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <SendSummaryButton data={{ batchAttendance: data.batchAttendance, overdueCount: data.overdueCount, totalOutstanding: data.totalOutstanding, totalAbsentToday, totalPresentToday, totalEnrolled, today: data.today }} />
      </div>

      {/* ── Summary cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Today's attendance</p>
          <p className="mt-1 text-2xl font-bold">{totalPresentToday}/{totalEnrolled}</p>
          <p className="text-xs text-zinc-500">{totalAbsentToday} absent</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Defaulters</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{data.overdueCount}</p>
          <p className="text-xs text-zinc-500">{data.defaulterList.length - data.overdueCount} due soon</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Outstanding fees</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">₹{data.totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Active batches</p>
          <p className="mt-1 text-2xl font-bold">{data.batchAttendance.length}</p>
        </div>
      </div>

      {/* ── Daily attendance by batch ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Today's attendance by batch</h2>
          <p className="text-sm text-zinc-500">{data.today}</p>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.batchAttendance.map((batch) => {
            const pct = batch.attendancePct
            return (
              <div key={batch.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <div className="flex-1">
                  <Link href={`/batches/${batch.id}`} className="font-medium hover:text-zinc-600 dark:hover:text-zinc-300">{batch.name}</Link>
                  <p className="text-xs text-zinc-500">{batch.schedule_text || batch.start_time?.slice(0, 5)} · {batch.enrolledCount} enrolled</p>
                </div>
                {!batch.sessionTaken ? (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800">No session</span>
                ) : (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 font-medium">{batch.present} present</span>
                    {batch.absent > 0 && <span className="text-red-600 font-medium">{batch.absent} absent</span>}
                    {batch.late > 0 && <span className="text-amber-600">{batch.late} late</span>}
                    {pct !== null && (
                      <span className={`rounded-full px-2.5 py-0.5 font-medium ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Fee defaulters ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fee defaulters</h2>
            <Link href="/communication?tab=defaulters" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Notify all</Link>
          </div>
          <p className="text-sm text-zinc-500">{data.defaulterList.length} unpaid invoices</p>
        </div>
        {data.defaulterList.length === 0 ? (
          <p className="px-5 py-4 text-sm text-zinc-500">All invoices paid. </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Student</th>
                  <th className="px-5 py-3 text-left font-medium">Plan</th>
                  <th className="px-5 py-3 text-left font-medium">Due</th>
                  <th className="px-5 py-3 text-left font-medium">Overdue</th>
                  <th className="px-5 py-3 text-left font-medium">Contact</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.defaulterList.map((d: any) => (
                  <tr key={d.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${d.daysOverdue > 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-5 py-3 font-medium">{d.student?.full_name}</td>
                    <td className="px-5 py-3 text-zinc-500">{d.plan?.name}</td>
                    <td className={`px-5 py-3 ${d.daysOverdue > 0 ? 'text-red-600 font-medium' : 'text-zinc-500'}`}>{d.dueDate}</td>
                    <td className="px-5 py-3">
                      {d.daysOverdue > 0 ? (
                        <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{d.daysOverdue}d</span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {d.student?.phone || ''}{d.student?.parent_phone ? ` / ${d.student.parent_phone}` : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-red-600">₹{d.balance.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/invoices/${d.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View</Link>
                        <Link href={`/communication?student=${d.student?.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Alert</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Batch performance (30-day attendance %) ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Batch performance (30 days)</h2>
          <p className="text-sm text-zinc-500">Attendance percentage per batch</p>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.batchPerformance.map((bp) => (
            <div key={bp.name} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1">
                <p className="font-medium">{bp.name}</p>
                <p className="text-xs text-zinc-500">{bp.sessions} sessions · {bp.totalMarks} marks</p>
              </div>
              <div className="flex items-center gap-3">
                {bp.pct === null ? (
                  <span className="text-xs text-zinc-400">No data</span>
                ) : (
                  <>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div className={`h-full rounded-full ${bp.pct >= 80 ? 'bg-green-500' : bp.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bp.pct}%` }} />
                    </div>
                    <span className={`text-sm font-medium ${bp.pct >= 80 ? 'text-green-600' : bp.pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{bp.pct}%</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly collection trend ── */}
      {data.weeklyCollection.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">Collection trend (8 weeks)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Week starting</th>
                  <th className="px-5 py-3 text-right font-medium">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.weeklyCollection.map((w) => (
                  <tr key={w.week} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-5 py-3">{new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">₹{w.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
