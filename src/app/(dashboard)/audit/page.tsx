import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function AuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') notFound()

  let logs: any[] = []
  let dbError: string | null = null

  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('center_id', profile.center_id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      dbError = error.message
    } else {
      logs = data || []
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Failed to load logs'
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <span className="text-sm text-zinc-500">{logs.length} entries</span>
      </div>

      {dbError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Error loading logs: {dbError}
          <p className="mt-1 text-xs text-red-500">
            Make sure the <code className="rounded bg-red-100 px-1 dark:bg-red-900">error_logs</code> table exists. Run the 006_error_logs.sql migration.
          </p>
        </div>
      )}

      {logs.length === 0 && !dbError && (
        <div className="rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          No error logs recorded yet.
        </div>
      )}

      {logs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Time</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Source</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Action</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50">
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      log.source === 'api_route'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {log.source === 'api_route' ? 'API' : 'Action'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {log.action_name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="block max-w-md truncate text-xs text-red-600 dark:text-red-400" title={log.error_message}>
                      {log.error_message}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
