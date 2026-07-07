'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, isKnownNextError } from '@/lib/error-logger'
import { getSiteUrl } from '@/lib/url'

type ActionResult = { error: string } | null

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function signup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
  const admin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const centerName = formData.get('center_name') as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (authError) return { error: authError.message }

  const user = authData.user
  if (!user) return { error: 'Failed to create user.' }

  const slug = slugify(centerName || `${fullName}-coaching`)

  const { data: center, error: centerError } = await admin
    .from('coaching_centers')
    .insert({
      name: centerName || `${fullName}'s Coaching Center`,
      slug,
      owner_user_id: user.id,
    })
    .select('id')
    .single()

  if (centerError) return { error: `Failed to create center: ${centerError.message}` }

  const { error: profileError } = await admin.from('profiles').insert({
    id: user.id,
    center_id: center.id,
    full_name: fullName,
    role: 'owner',
  })

  if (profileError) return { error: `Failed to create profile: ${profileError.message}` }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'signup', center_id: null, error: err })
    return { error: err instanceof Error ? err.message : 'Failed to sign up' }
  }
}

type LoginResult = { error: string } | { success: true } | null

export async function login(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { error: error.message }

    return { success: true }
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'login', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to log in' }
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'logout', error: err })
    redirect('/login')
  }
}

export async function sendResetEmail(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    })

    if (error) return { error: error.message }
    return null
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'sendResetEmail', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to send reset email' }
  }
}

export async function updatePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (err) {
    if (isKnownNextError(err)) throw err
    await logError({ source: 'server_action', name: 'updatePassword', error: err })
    return { error: err instanceof Error ? err.message : 'Failed to update password' }
  }
}
