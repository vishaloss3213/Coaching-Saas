'use client'

import { useActionState } from 'react'
import { signup } from '@/lib/auth/actions'

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium mb-1">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="center_name" className="block text-sm font-medium mb-1">
          Coaching center name
        </label>
        <input
          id="center_name"
          name="center_name"
          type="text"
          required
          placeholder="e.g. Brilliant Minds Academy"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-zinc-900 underline dark:text-white">
          Sign in
        </a>
      </p>
    </form>
  )
}
