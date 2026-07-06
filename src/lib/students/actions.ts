'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getStudents() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('created_at', { ascending: false })

  return students || []
}

export async function getStudent(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) redirect('/students')

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()

  if (profile && student.center_id !== profile.center_id) redirect('/students')

  return student
}

type ActionResult = { error: string } | null

export async function createStudent(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  const { error } = await supabase.from('students').insert({
    center_id: profile.center_id,
    full_name: formData.get('full_name') as string,
    gender: (formData.get('gender') as string) || null,
    dob: (formData.get('dob') as string) || null,
    phone: (formData.get('phone') as string) || null,
    parent_name: (formData.get('parent_name') as string) || null,
    parent_phone: (formData.get('parent_phone') as string) || null,
    joining_date: (formData.get('joining_date') as string) || new Date().toISOString().split('T')[0],
    status: (formData.get('status') as string) || 'active',
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/students')
  redirect('/students')
}

export async function updateStudent(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('center_id')
    .eq('id', user.id)
    .single()
  if (!profile) return { error: 'Profile not found' }

  const { data: student } = await supabase
    .from('students')
    .select('center_id')
    .eq('id', id)
    .single()
  if (!student || student.center_id !== profile.center_id) return { error: 'Student not found' }

  const { error } = await supabase
    .from('students')
    .update({
      full_name: formData.get('full_name') as string,
      gender: (formData.get('gender') as string) || null,
      dob: (formData.get('dob') as string) || null,
      phone: (formData.get('phone') as string) || null,
      parent_name: (formData.get('parent_name') as string) || null,
      parent_phone: (formData.get('parent_phone') as string) || null,
      joining_date: (formData.get('joining_date') as string),
      status: (formData.get('status') as string) || 'active',
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/students')
  redirect('/students')
}

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('students').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/students')
  redirect('/students')
}
