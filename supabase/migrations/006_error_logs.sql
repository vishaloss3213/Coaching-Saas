CREATE TABLE error_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id   UUID REFERENCES coaching_centers(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source      TEXT NOT NULL CHECK (source IN ('server_action', 'api_route')),
  action_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  url         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "error_logs_select" ON error_logs
  FOR SELECT USING (center_id = public.current_center_id());

CREATE INDEX idx_error_logs_center ON error_logs(center_id);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
