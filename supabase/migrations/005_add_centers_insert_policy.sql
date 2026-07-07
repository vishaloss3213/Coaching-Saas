-- Add missing INSERT/DELETE policies for coaching_centers
DROP POLICY IF EXISTS "centers_insert" ON coaching_centers;
CREATE POLICY "centers_insert" ON coaching_centers FOR INSERT WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "centers_delete" ON coaching_centers;
CREATE POLICY "centers_delete" ON coaching_centers FOR DELETE USING (owner_user_id = auth.uid());
