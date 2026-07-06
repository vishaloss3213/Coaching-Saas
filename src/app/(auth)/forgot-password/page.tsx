'use client'

import { useActionState } from 'react'
import { sendResetEmail } from '@/lib/auth/actions'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(sendResetEmail, null)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-center">Reset password</h1>
      {state === null ? (
        <p className="mb-4 text-sm text-green-600 text-center">
          Check your email for a reset link.
        </p>
      ) : (
        <form action={action} className="space-y-4">
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
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
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-zinc-500">
        <a href="/login" className="font-medium text-zinc-900 underline">
          Back to sign in
        </a>
      </p>
    </div>
  )
}
