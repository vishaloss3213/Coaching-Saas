import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/error-logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data } = await supabase
      .from('student_batches')
      .select('students(id, full_name, phone)')
      .eq('batch_id', id)
      .eq('active', true)

    const students = (data || []).map((e: any) => e.students).filter(Boolean)
    return NextResponse.json(students)
  } catch (err) {
    await logError({ source: 'api_route', name: 'GET /api/batches/[id]/students', error: err })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
