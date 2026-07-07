import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logError } from '@/lib/error-logger'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const sessionResult = {
      success: !sessionError,
      hasSession: !!sessionData?.session,
      error: sessionError?.message || null,
      sessionUser: sessionData?.session?.user?.email || null,
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const userResult = {
      success: !userError,
      hasUser: !!userData?.user,
      error: userError?.message || null,
      userEmail: userData?.user?.email || null,
    }

    return NextResponse.json({
      session: sessionResult,
      user: userResult,
    })
  } catch (err) {
    await logError({ source: 'api_route', name: 'GET /api/verify-supabase', error: err })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
