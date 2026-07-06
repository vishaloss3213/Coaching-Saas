export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    excused: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] || colors.excused}`}
    >
      {status}
    </span>
  )
}
