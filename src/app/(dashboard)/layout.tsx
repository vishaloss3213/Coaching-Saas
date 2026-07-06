import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/batches', label: 'Batches' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/fee-plans', label: 'Fee Plans' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/reports', label: 'Reports' },
  { href: '/communication', label: 'Communication' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, coaching_centers(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex">
      <aside className="flex w-56 flex-col border-r border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          {profile?.coaching_centers?.name || 'Dashboard'}
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="mb-1 text-xs text-zinc-500">{profile?.full_name}</p>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
