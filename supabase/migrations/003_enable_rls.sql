-- ============================================================
-- Migration 003: Fix schema + Enable RLS on all tables
-- ============================================================

-- ---------------------------
-- 3a. Schema fixes
-- ---------------------------
ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS recipient    TEXT;
ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE reminder_logs ALTER COLUMN student_id DROP NOT NULL;
ALTER TYPE trigger_type ADD VALUE IF NOT EXISTS 'attendance_gap';
ALTER TYPE trigger_type ADD VALUE IF NOT EXISTS 'custom';

-- ---------------------------
-- 3b. Helper: get current user's center_id
-- ---------------------------
CREATE OR REPLACE FUNCTION public.current_center_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT center_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ---------------------------
-- 3c. Enable RLS on all tables
-- ---------------------------
ALTER TABLE coaching_centers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE students            ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_batches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs       ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- 3d. RLS Policies
-- ---------------------------

-- coaching_centers
DROP POLICY IF EXISTS "centers_owner_select" ON coaching_centers;
CREATE POLICY "centers_owner_select" ON coaching_centers FOR SELECT USING (owner_user_id = auth.uid());
DROP POLICY IF EXISTS "centers_owner_update" ON coaching_centers;
CREATE POLICY "centers_owner_update" ON coaching_centers FOR UPDATE USING (owner_user_id = auth.uid());

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- students
DROP POLICY IF EXISTS "students_select" ON students;
CREATE POLICY "students_select" ON students FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "students_insert" ON students;
CREATE POLICY "students_insert" ON students FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "students_update" ON students;
CREATE POLICY "students_update" ON students FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "students_delete" ON students;
CREATE POLICY "students_delete" ON students FOR DELETE USING (center_id = public.current_center_id());

-- teachers
DROP POLICY IF EXISTS "teachers_select" ON teachers;
CREATE POLICY "teachers_select" ON teachers FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "teachers_insert" ON teachers;
CREATE POLICY "teachers_insert" ON teachers FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "teachers_update" ON teachers;
CREATE POLICY "teachers_update" ON teachers FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "teachers_delete" ON teachers;
CREATE POLICY "teachers_delete" ON teachers FOR DELETE USING (center_id = public.current_center_id());

-- batches
DROP POLICY IF EXISTS "batches_select" ON batches;
CREATE POLICY "batches_select" ON batches FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "batches_insert" ON batches;
CREATE POLICY "batches_insert" ON batches FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "batches_update" ON batches;
CREATE POLICY "batches_update" ON batches FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "batches_delete" ON batches;
CREATE POLICY "batches_delete" ON batches FOR DELETE USING (center_id = public.current_center_id());

-- student_batches
DROP POLICY IF EXISTS "student_batches_select" ON student_batches;
CREATE POLICY "student_batches_select" ON student_batches FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "student_batches_insert" ON student_batches;
CREATE POLICY "student_batches_insert" ON student_batches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "student_batches_update" ON student_batches;
CREATE POLICY "student_batches_update" ON student_batches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "student_batches_delete" ON student_batches;
CREATE POLICY "student_batches_delete" ON student_batches FOR DELETE USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);

-- attendance_sessions
DROP POLICY IF EXISTS "att_sessions_select" ON attendance_sessions;
CREATE POLICY "att_sessions_select" ON attendance_sessions FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "att_sessions_insert" ON attendance_sessions;
CREATE POLICY "att_sessions_insert" ON attendance_sessions FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "att_sessions_update" ON attendance_sessions;
CREATE POLICY "att_sessions_update" ON attendance_sessions FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "att_sessions_delete" ON attendance_sessions;
CREATE POLICY "att_sessions_delete" ON attendance_sessions FOR DELETE USING (center_id = public.current_center_id());

-- attendance_records
DROP POLICY IF EXISTS "att_records_select" ON attendance_records;
CREATE POLICY "att_records_select" ON attendance_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM attendance_sessions s WHERE s.id = session_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "att_records_insert" ON attendance_records;
CREATE POLICY "att_records_insert" ON attendance_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM attendance_sessions s WHERE s.id = session_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "att_records_update" ON attendance_records;
CREATE POLICY "att_records_update" ON attendance_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM attendance_sessions s WHERE s.id = session_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "att_records_delete" ON attendance_records;
CREATE POLICY "att_records_delete" ON attendance_records FOR DELETE USING (
  EXISTS (SELECT 1 FROM attendance_sessions s WHERE s.id = session_id AND s.center_id = public.current_center_id())
);

-- fee_plans
DROP POLICY IF EXISTS "fee_plans_select" ON fee_plans;
CREATE POLICY "fee_plans_select" ON fee_plans FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_plans_insert" ON fee_plans;
CREATE POLICY "fee_plans_insert" ON fee_plans FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_plans_update" ON fee_plans;
CREATE POLICY "fee_plans_update" ON fee_plans FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_plans_delete" ON fee_plans;
CREATE POLICY "fee_plans_delete" ON fee_plans FOR DELETE USING (center_id = public.current_center_id());

-- fee_invoices
DROP POLICY IF EXISTS "fee_invoices_select" ON fee_invoices;
CREATE POLICY "fee_invoices_select" ON fee_invoices FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_invoices_insert" ON fee_invoices;
CREATE POLICY "fee_invoices_insert" ON fee_invoices FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_invoices_update" ON fee_invoices;
CREATE POLICY "fee_invoices_update" ON fee_invoices FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "fee_invoices_delete" ON fee_invoices;
CREATE POLICY "fee_invoices_delete" ON fee_invoices FOR DELETE USING (center_id = public.current_center_id());

-- payments
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM fee_invoices i WHERE i.id = invoice_id AND i.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM fee_invoices i WHERE i.id = invoice_id AND i.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM fee_invoices i WHERE i.id = invoice_id AND i.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "payments_delete" ON payments;
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (
  EXISTS (SELECT 1 FROM fee_invoices i WHERE i.id = invoice_id AND i.center_id = public.current_center_id())
);

-- reminder_rules
DROP POLICY IF EXISTS "reminder_rules_select" ON reminder_rules;
CREATE POLICY "reminder_rules_select" ON reminder_rules FOR SELECT USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "reminder_rules_insert" ON reminder_rules;
CREATE POLICY "reminder_rules_insert" ON reminder_rules FOR INSERT WITH CHECK (center_id = public.current_center_id());
DROP POLICY IF EXISTS "reminder_rules_update" ON reminder_rules;
CREATE POLICY "reminder_rules_update" ON reminder_rules FOR UPDATE USING (center_id = public.current_center_id());
DROP POLICY IF EXISTS "reminder_rules_delete" ON reminder_rules;
CREATE POLICY "reminder_rules_delete" ON reminder_rules FOR DELETE USING (center_id = public.current_center_id());

-- reminder_logs
DROP POLICY IF EXISTS "reminder_logs_select" ON reminder_logs;
CREATE POLICY "reminder_logs_select" ON reminder_logs FOR SELECT USING (
  student_id IS NULL OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "reminder_logs_insert" ON reminder_logs;
CREATE POLICY "reminder_logs_insert" ON reminder_logs FOR INSERT WITH CHECK (
  student_id IS NULL OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "reminder_logs_update" ON reminder_logs;
CREATE POLICY "reminder_logs_update" ON reminder_logs FOR UPDATE USING (
  student_id IS NULL OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
DROP POLICY IF EXISTS "reminder_logs_delete" ON reminder_logs;
CREATE POLICY "reminder_logs_delete" ON reminder_logs FOR DELETE USING (
  student_id IS NULL OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.center_id = public.current_center_id())
);
