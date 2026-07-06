import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from './form'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=invalid_reset_link')
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-center">Set new password</h1>
      <ResetPasswordForm />
    </div>
  )
}
