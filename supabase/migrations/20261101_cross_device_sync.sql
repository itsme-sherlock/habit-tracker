ALTER TABLE daily_completions
    ADD COLUMN IF NOT EXISTS day_ended BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE daily_completions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS sync_deletions (
    entity_type TEXT NOT NULL CHECK (entity_type IN ('habits', 'tasks', 'completions')),
    entity_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_deletions_user_deleted
    ON sync_deletions(user_id, deleted_at);

ALTER TABLE sync_deletions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own sync deletions" ON sync_deletions;
CREATE POLICY "Users manage own sync deletions" ON sync_deletions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_completions_updated_at ON daily_completions;
CREATE TRIGGER update_daily_completions_updated_at
    BEFORE UPDATE ON daily_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
