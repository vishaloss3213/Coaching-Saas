'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth/actions'

export function LoginForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(login, null)

  useEffect(() => {
    if (state && 'success' in state) {
      router.push('/dashboard')
    }
  }, [state, router])

  return (
    <form action={action} className="space-y-4">
      {state && 'error' in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}
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
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="text-right">
        <a href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-900 underline">
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-zinc-500">
        No account?{' '}
        <a href="/signup" className="font-medium text-zinc-900 underline dark:text-white">
          Sign up
        </a>
      </p>
    </form>
  )
}
