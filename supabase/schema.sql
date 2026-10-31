-- Habit Tracker Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== HABITS TABLE ====================
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT DEFAULT 'daily',
    target_count INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'times' CHECK (unit IN ('times', 'hours', 'minutes')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    "order" INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_habits_user_order ON habits(user_id, "order");
CREATE INDEX idx_habits_user_created ON habits(user_id, created_at);

-- ==================== STUDY TASKS TABLE ====================
CREATE TABLE study_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
    category TEXT NOT NULL CHECK (category IN ('study', 'practice', 'review', 'mock-exam')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX idx_study_tasks_user_date ON study_tasks(user_id, date);
CREATE INDEX idx_study_tasks_user_date_completed ON study_tasks(user_id, date, completed);

-- ==================== DAILY COMPLETIONS TABLE ====================
CREATE TABLE daily_completions (
    date DATE NOT NULL,
    habit_completions JSONB NOT NULL DEFAULT '{}',
    task_completions UUID[] DEFAULT '{}',
    notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mood SMALLINT CHECK (mood BETWEEN 1 AND 5),
    day_ended BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (date, user_id)
);

ALTER TABLE daily_completions
    ADD COLUMN IF NOT EXISTS day_ended BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE daily_completions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Index for date range queries
CREATE INDEX idx_daily_completions_user_date ON daily_completions(user_id, date);

-- Tombstones allow deletes made on one device to propagate to other devices.
CREATE TABLE IF NOT EXISTS sync_deletions (
    entity_type TEXT NOT NULL CHECK (entity_type IN ('habits', 'tasks', 'completions')),
    entity_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_deletions_user_deleted
    ON sync_deletions(user_id, deleted_at);

-- ==================== ROW LEVEL SECURITY ====================
-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_deletions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users manage own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tasks" ON study_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own completions" ON daily_completions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own sync deletions" ON sync_deletions;
CREATE POLICY "Users manage own sync deletions" ON sync_deletions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==================== UPDATED_AT TRIGGERS ====================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for habits
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for study_tasks
CREATE TRIGGER update_study_tasks_updated_at
    BEFORE UPDATE ON study_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_completions_updated_at ON daily_completions;
CREATE TRIGGER update_daily_completions_updated_at
    BEFORE UPDATE ON daily_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== HELPER VIEWS ====================
-- View: Today's plan for a user
CREATE OR REPLACE VIEW today_plan AS
SELECT
    h.id as habit_id,
    h.name as habit_name,
    h.description as habit_description,
    h.target_count,
    h.unit,
    h."order" as habit_order,
    st.id as task_id,
    st.date as task_date,
    st.title as task_title,
    st.description as task_description,
    st.duration_minutes,
    st.category,
    st.completed as task_completed,
    dc.habit_completions,
    dc.task_completions,
    dc.notes,
    dc.mood,
    dc.completed_at as completion_time
FROM habits h
LEFT JOIN study_tasks st ON st.user_id = h.user_id AND st.date = CURRENT_DATE
LEFT JOIN daily_completions dc ON dc.user_id = h.user_id AND dc.date = CURRENT_DATE
WHERE h.user_id = auth.uid()
ORDER BY h."order", st.created_at;

-- View: Weekly stats
CREATE OR REPLACE VIEW weekly_stats AS
SELECT
    dc.date,
    dc.habit_completions,
    dc.task_completions,
    dc.mood,
    COUNT(st.id) as total_tasks,
    SUM(CASE WHEN st.id = ANY(dc.task_completions) OR st.completed THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN st.id = ANY(dc.task_completions) OR st.completed THEN st.duration_minutes ELSE 0 END) as study_minutes
FROM daily_completions dc
LEFT JOIN study_tasks st ON st.user_id = dc.user_id AND st.date = dc.date
WHERE dc.user_id = auth.uid()
GROUP BY dc.date, dc.habit_completions, dc.task_completions, dc.mood
ORDER BY dc.date;

-- ==================== SAMPLE DATA (Optional - for testing) ====================
-- INSERT INTO habits (name, description, target_count, unit, "order", user_id)
-- VALUES
--     ('Study GCP', 'Complete GCP Data Engineer curriculum', 1, 'times', 0, auth.uid()),
--     ('Exercise', '30 minutes of activity', 1, 'times', 1, auth.uid()),
--     ('Drink Water', 'Stay hydrated throughout the day', 8, 'times', 2, auth.uid()),
--     ('Read', 'Technical reading', 30, 'minutes', 3, auth.uid());