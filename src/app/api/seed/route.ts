import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logError } from '@/lib/error-logger'

const TEACHERS = [
  { full_name: 'Amit Sharma', phone: '9876543210', specialization: 'Mathematics' },
  { full_name: 'Priya Patel', phone: '9876543211', specialization: 'Science' },
  { full_name: 'Rahul Verma', phone: '9876543212', specialization: 'English' },
  { full_name: 'Sunita Gupta', phone: '9876543213', specialization: 'Hindi' },
]

const STUDENTS = [
  { full_name: 'Arjun Singh', gender: 'male', phone: '9000000001', parent_name: 'Mr. Singh', parent_phone: '9000000091' },
  { full_name: 'Neha Kapoor', gender: 'female', phone: '9000000002', parent_name: 'Mrs. Kapoor', parent_phone: '9000000092' },
  { full_name: 'Rohan Mehta', gender: 'male', phone: '9000000003', parent_name: 'Mr. Mehta', parent_phone: '9000000093' },
  { full_name: 'Priyanka Joshi', gender: 'female', phone: '9000000004', parent_name: 'Mr. Joshi', parent_phone: '9000000094' },
  { full_name: 'Vikram Reddy', gender: 'male', phone: '9000000005', parent_name: 'Mrs. Reddy', parent_phone: '9000000095' },
  { full_name: 'Ananya Gupta', gender: 'female', phone: '9000000006', parent_name: 'Mr. Gupta', parent_phone: '9000000096' },
  { full_name: 'Karan Patel', gender: 'male', phone: '9000000007', parent_name: 'Mrs. Patel', parent_phone: '9000000097' },
  { full_name: 'Divya Nair', gender: 'female', phone: '9000000008', parent_name: 'Mr. Nair', parent_phone: '9000000098' },
  { full_name: 'Siddharth Rai', gender: 'male', phone: '9000000009', parent_name: 'Mrs. Rai', parent_phone: '9000000099' },
  { full_name: 'Kavita Deshmukh', gender: 'female', phone: '9000000010', parent_name: 'Mr. Deshmukh', parent_phone: '9000000100' },
  { full_name: 'Rajat Bansal', gender: 'male', phone: '9000000011', parent_name: 'Mrs. Bansal', parent_phone: '9000000101' },
  { full_name: 'Pooja Iyer', gender: 'female', phone: '9000000012', parent_name: 'Mr. Iyer', parent_phone: '9000000102' },
]

export async function GET() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('center_id').eq('id', user.id).single()
  if (!profile) {
    return NextResponse.json({ error: 'No profile found' }, { status: 400 })
  }

  const centerId = profile.center_id
  const logs: string[] = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  try {
    // 1. Teachers
    const teacherIds: string[] = []
    for (const t of TEACHERS) {
      const { data, error } = await admin.from('teachers').insert({
        center_id: centerId, full_name: t.full_name, phone: t.phone,
        specialization: t.specialization, active: true,
      }).select('id').single()
      if (error) { logs.push(`Teacher error: ${error.message}`); continue }
      teacherIds.push(data.id)
    }
    logs.push(`Created ${teacherIds.length} teachers`)

    // 2. Students
    const studentIds: string[] = []
    for (const s of STUDENTS) {
      const daysAgo = Math.floor(Math.random() * 180)
      const joinDate = new Date(today)
      joinDate.setDate(joinDate.getDate() - daysAgo)
      const { data, error } = await admin.from('students').insert({
        center_id: centerId, full_name: s.full_name, gender: s.gender,
        phone: s.phone, parent_name: s.parent_name, parent_phone: s.parent_phone,
        status: 'active', joining_date: joinDate.toISOString().split('T')[0],
      }).select('id').single()
      if (error) { logs.push(`Student error: ${error.message}`); continue }
      studentIds.push(data.id)
    }
    logs.push(`Created ${studentIds.length} students`)

    // 3. Batches
    const batchData = [
      { name: 'Mathematics - Class X', subject: 'Mathematics', schedule: 'Mon/Wed/Fri 4-5pm', teacherIdx: 0 },
      { name: 'Science - Class X', subject: 'Science', schedule: 'Tue/Thu/Sat 4-5pm', teacherIdx: 1 },
      { name: 'English Grammar', subject: 'English', schedule: 'Mon/Wed/Fri 5-6pm', teacherIdx: 2 },
      { name: 'Hindi Literature', subject: 'Hindi', schedule: 'Tue/Thu 5-6pm', teacherIdx: 3 },
    ]
    const batchIds: string[] = []
    for (const b of batchData) {
      const tId = teacherIds[b.teacherIdx] || null
      const { data, error } = await admin.from('batches').insert({
        center_id: centerId, name: b.name, subject: b.subject,
        teacher_id: tId, schedule_text: b.schedule,
        start_time: b.schedule.includes('4') ? '16:00' : '17:00',
        end_time: b.schedule.includes('4') ? '17:00' : '18:00',
        capacity: 30, active: true,
      }).select('id').single()
      if (error) { logs.push(`Batch error: ${error.message}`); continue }
      batchIds.push(data.id)
    }
    logs.push(`Created ${batchIds.length} batches`)

    // 4. Enroll students in batches (each student in 1-2 batches)
    let enrolledCount = 0
    for (const sId of studentIds) {
      const numBatches = 1 + Math.floor(Math.random() * 2)
      const shuffled = [...batchIds].sort(() => Math.random() - 0.5).slice(0, numBatches)
      for (const bId of shuffled) {
        const { error } = await admin.from('student_batches').insert({
          student_id: sId, batch_id: bId, active: true,
        })
        if (!error) enrolledCount++
      }
    }
    logs.push(`Created ${enrolledCount} enrollments`)

    // 5. Fee plans
    const feePlanData = [
      { name: 'Monthly Tuition', amount: 1500, cycle: 'monthly', dueDay: 10 },
      { name: 'Quarterly Tuition', amount: 4000, cycle: 'quarterly', dueDay: 5 },
      { name: 'Annual Subscription', amount: 14000, cycle: 'yearly', dueDay: 1 },
    ]
    const feePlanIds: string[] = []
    for (const f of feePlanData) {
      const { data, error } = await admin.from('fee_plans').insert({
        center_id: centerId, name: f.name, amount: f.amount,
        cycle_type: f.cycle, due_day: f.dueDay, active: true,
      }).select('id').single()
      if (error) { logs.push(`Fee plan error: ${error.message}`); continue }
      feePlanIds.push(data.id)
    }
    logs.push(`Created ${feePlanIds.length} fee plans`)

    // 6. Invoices (some paid, some pending, some overdue)
    let invoiceCount = 0
    const invoiceIds: string[] = []
    for (const sId of studentIds) {
      const planId = feePlanIds[Math.floor(Math.random() * feePlanIds.length)]
      const monthsAgo = Math.floor(Math.random() * 3)
      const periodStart = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1)
      const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)
      const dueDate = new Date(periodStart)
      dueDate.setDate(10)

      let status: string, amountPaid: number
      const rand = Math.random()
      if (rand < 0.4) { status = 'paid'; amountPaid = 1500 }
      else if (rand < 0.7) { status = 'pending'; amountPaid = 0 }
      else { status = 'overdue'; amountPaid = 0 }

      const { data, error } = await admin.from('fee_invoices').insert({
        center_id: centerId, student_id: sId, fee_plan_id: planId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        amount_due: 1500, amount_paid: amountPaid, status,
      }).select('id').single()

      if (error) { logs.push(`Invoice error: ${error.message}`); continue }
      invoiceIds.push(data.id)
      invoiceCount++

      // Payment record for paid invoices
      if (status === 'paid') {
        const payDate = new Date(periodStart)
        payDate.setDate(payDate.getDate() + Math.floor(Math.random() * 10))
        await admin.from('payments').insert({
          invoice_id: data.id, student_id: sId, amount: 1500,
          method: 'cash', paid_at: payDate.toISOString(),
        })
      }
    }
    logs.push(`Created ${invoiceCount} invoices`)

    // 7. Attendance sessions
    let sessionCount = 0
    for (const bId of batchIds) {
      for (let d = 5; d >= 0; d--) {
        const sessionDate = new Date(today)
        sessionDate.setDate(sessionDate.getDate() - d)
        if (sessionDate.getDay() === 0) continue // skip Sundays

        const { data: session, error } = await admin.from('attendance_sessions').insert({
          center_id: centerId, batch_id: bId,
          session_date: sessionDate.toISOString().split('T')[0],
          start_time: '16:00', end_time: '17:00',
        }).select('id').single()

        if (error) continue
        sessionCount++

        // Mark attendance for enrolled students
        const { data: enrolled } = await admin
          .from('student_batches').select('student_id')
          .eq('batch_id', bId).eq('active', true)

        if (enrolled) {
          for (const e of enrolled) {
            const statuses = ['present', 'present', 'present', 'present', 'absent', 'late']
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            await admin.from('attendance_records').insert({
              session_id: session.id, student_id: e.student_id, status,
            })
          }
        }
      }
    }
    logs.push(`Created ${sessionCount} attendance sessions`)

    // 8. Reminder rules
    await admin.from('reminder_rules').insert([
      { center_id: centerId, trigger_type: 'fee_due', offset_days: 3, channel: 'sms', template_name: 'fee_due_reminder', active: true },
      { center_id: centerId, trigger_type: 'fee_overdue', offset_days: 1, channel: 'whatsapp', template_name: 'fee_overdue_alert', active: true },
      { center_id: centerId, trigger_type: 'attendance_low', offset_days: 0, channel: 'sms', template_name: 'low_attendance', active: true },
    ])
    logs.push('Created 3 reminder rules')

    return NextResponse.json({ success: true, logs })
  } catch (e: any) {
    await logError({ source: 'api_route', name: 'GET /api/seed', error: e })
    return NextResponse.json({ error: e.message, logs }, { status: 500 })
  }
}
