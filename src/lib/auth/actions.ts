'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
  const supabase = await createClient()

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

  const { data: center, error: centerError } = await supabase
    .from('coaching_centers')
    .insert({
      name: centerName || `${fullName}'s Coaching Center`,
      slug,
      owner_user_id: user.id,
    })
    .select('id')
    .single()

  if (centerError) return { error: `Failed to create center: ${centerError.message}` }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    center_id: center.id,
    full_name: fullName,
    role: 'owner',
  })

  if (profileError) return { error: `Failed to create profile: ${profileError.message}` }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
