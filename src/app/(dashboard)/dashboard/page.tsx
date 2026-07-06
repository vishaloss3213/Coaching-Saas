import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, coaching_centers(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Center</p>
          <p className="mt-1 text-lg font-semibold">{profile?.coaching_centers?.name}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Role</p>
          <p className="mt-1 text-lg font-semibold capitalize">{profile?.role}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="mt-1 text-lg font-semibold">{user?.email}</p>
        </div>
      </div>
      <p className="text-sm text-zinc-500">
        Students, batches, attendance, and fees will appear here next.
      </p>
    </div>
  )
}
