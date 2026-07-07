import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/error-logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, password } = await request.json()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    await logError({ source: 'api_route', name: 'POST /api/login', error: err })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    )
  }
}
