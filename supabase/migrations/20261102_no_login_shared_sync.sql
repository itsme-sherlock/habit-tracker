-- Single-owner, no-login sync: every device uses the fixed owner id below.
-- Anyone with the anon key can read/write; acceptable only for personal use.
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_user_id_fkey;
ALTER TABLE study_tasks DROP CONSTRAINT IF EXISTS study_tasks_user_id_fkey;
ALTER TABLE daily_completions DROP CONSTRAINT IF EXISTS daily_completions_user_id_fkey;
ALTER TABLE sync_deletions DROP CONSTRAINT IF EXISTS sync_deletions_user_id_fkey;

DROP POLICY IF EXISTS "Users manage own habits" ON habits;
DROP POLICY IF EXISTS "Users manage own tasks" ON study_tasks;
DROP POLICY IF EXISTS "Users manage own completions" ON daily_completions;
DROP POLICY IF EXISTS "Users manage own sync deletions" ON sync_deletions;

DROP POLICY IF EXISTS "Shared owner habits" ON habits;
DROP POLICY IF EXISTS "Shared owner tasks" ON study_tasks;
DROP POLICY IF EXISTS "Shared owner completions" ON daily_completions;
DROP POLICY IF EXISTS "Shared owner sync deletions" ON sync_deletions;

CREATE POLICY "Shared owner habits" ON habits FOR ALL TO anon, authenticated
    USING (user_id = '00000000-0000-0000-0000-000000000001')
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Shared owner tasks" ON study_tasks FOR ALL TO anon, authenticated
    USING (user_id = '00000000-0000-0000-0000-000000000001')
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Shared owner completions" ON daily_completions FOR ALL TO anon, authenticated
    USING (user_id = '00000000-0000-0000-0000-000000000001')
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Shared owner sync deletions" ON sync_deletions FOR ALL TO anon, authenticated
    USING (user_id = '00000000-0000-0000-0000-000000000001')
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
