-- ============================================================
-- Migration 001: Initial Schema
-- Coaching Management SaaS
-- Tables, enums, constraints, indexes, and triggers only.
-- RLS is in a separate file (002_rls_policies.sql) to avoid
-- blocking development before auth is implemented.
-- ============================================================

-- ---------------------------
-- 1. Extensions
-- ---------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------
-- 2. Enums
-- ---------------------------
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE invoice_status    AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method    AS ENUM ('cash', 'bank_transfer', 'upi', 'card', 'cheque');
CREATE TYPE reminder_channel  AS ENUM ('sms', 'email', 'whatsapp');
CREATE TYPE reminder_status   AS ENUM ('sent', 'failed', 'pending');
CREATE TYPE session_mode      AS ENUM ('offline', 'online');
CREATE TYPE check_in_method   AS ENUM ('manual', 'qr', 'biometric');
CREATE TYPE trigger_type      AS ENUM ('fee_due', 'fee_overdue', 'attendance_low');
CREATE TYPE profile_role      AS ENUM ('owner', 'admin', 'teacher', 'receptionist');

-- ---------------------------
-- 3. Tables (in dependency order)
-- ---------------------------

-- 3.1 coaching_centers
CREATE TABLE coaching_centers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 profiles
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id  UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  role       profile_role NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 students
CREATE TABLE students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id    UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  gender       TEXT CHECK (gender IN ('male', 'female', 'other')),
  dob          DATE,
  phone        TEXT,
  parent_name  TEXT,
  parent_phone TEXT,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'left')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_phone_per_center UNIQUE (center_id, phone)
);

-- 3.4 teachers
CREATE TABLE teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id       UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  specialization  TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 batches
CREATE TABLE batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id     UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  subject       TEXT,
  teacher_id    UUID REFERENCES teachers(id) ON DELETE SET NULL,
  schedule_text TEXT,
  start_time    TIME,
  end_time      TIME,
  capacity      INT CHECK (capacity > 0),
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_batch_name_per_center UNIQUE (center_id, name)
);

-- 3.6 student_batches
CREATE TABLE student_batches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch_id   UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at    TIMESTAMPTZ,
  active     BOOLEAN NOT NULL DEFAULT true
);

-- 3.7 attendance_sessions
CREATE TABLE attendance_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id    UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  batch_id     UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time   TIME,
  end_time     TIME,
  mode         session_mode NOT NULL DEFAULT 'offline',
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_session_per_batch_per_day UNIQUE (batch_id, session_date)
);

-- 3.8 attendance_records
CREATE TABLE attendance_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status          attendance_status NOT NULL DEFAULT 'present',
  check_in_method check_in_method NOT NULL DEFAULT 'manual',
  check_in_time   TIMESTAMPTZ,
  remarks         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_record_per_session_per_student UNIQUE (session_id, student_id)
);

-- 3.9 fee_plans
CREATE TABLE fee_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id   UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  cycle_type  TEXT NOT NULL CHECK (cycle_type IN ('monthly', 'quarterly', 'half_yearly', 'yearly')),
  due_day     INT CHECK (due_day BETWEEN 1 AND 31),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 fee_invoices
CREATE TABLE fee_invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id    UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_plan_id  UUID NOT NULL REFERENCES fee_plans(id) ON DELETE RESTRICT,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  due_date     DATE NOT NULL,
  amount_due   NUMERIC(10, 2) NOT NULL CHECK (amount_due > 0),
  amount_paid  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status       invoice_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_invoice_per_student_per_period UNIQUE (student_id, fee_plan_id, period_start),
  CONSTRAINT amount_paid_cannot_exceed_due CHECK (amount_paid <= amount_due)
);

-- 3.11 payments
CREATE TABLE payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  method     payment_method NOT NULL DEFAULT 'cash',
  reference  TEXT,
  paid_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 reminder_rules
CREATE TABLE reminder_rules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id    UUID NOT NULL REFERENCES coaching_centers(id) ON DELETE CASCADE,
  trigger_type trigger_type NOT NULL,
  offset_days  INT NOT NULL CHECK (offset_days > 0),
  channel      reminder_channel NOT NULL DEFAULT 'sms',
  template_name TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.13 reminder_logs
CREATE TABLE reminder_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_id         UUID REFERENCES fee_invoices(id) ON DELETE CASCADE,
  rule_id            UUID REFERENCES reminder_rules(id) ON DELETE SET NULL,
  channel            reminder_channel NOT NULL,
  sent_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  status             reminder_status NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------
-- 4. Indexes
-- ---------------------------
CREATE INDEX idx_students_center_status   ON students(center_id, status);
CREATE INDEX idx_students_center_phone    ON students(center_id, phone);
CREATE INDEX idx_batches_center_active    ON batches(center_id, active);
CREATE INDEX idx_teachers_center_active   ON teachers(center_id, active);
CREATE INDEX idx_sb_student_active        ON student_batches(student_id, active);
CREATE INDEX idx_sb_batch_active          ON student_batches(batch_id, active);
CREATE INDEX idx_att_sessions_batch_date  ON attendance_sessions(batch_id, session_date);
CREATE INDEX idx_att_records_session      ON attendance_records(session_id, student_id);
CREATE INDEX idx_fee_invoices_student     ON fee_invoices(student_id, status, due_date);
CREATE INDEX idx_payments_invoice         ON payments(invoice_id, paid_at);
CREATE INDEX idx_reminder_logs_student    ON reminder_logs(student_id, sent_at);

-- ---------------------------
-- 5. Updated-at trigger
-- ---------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON coaching_centers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON fee_plans
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON fee_invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reminder_rules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
