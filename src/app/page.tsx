import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Coaching Manager</h1>
      <p className="mb-8 text-zinc-500">Manage your coaching center with ease.</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-zinc-300 px-6 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
