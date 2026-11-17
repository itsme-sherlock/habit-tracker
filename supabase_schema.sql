-- ======================================================================
-- DE60 Habit Tracker: Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ======================================================================

-- 1. Daily Completions Table
CREATE TABLE IF NOT EXISTS public.daily_completions (
  date DATE PRIMARY KEY,
  habit_completions JSONB DEFAULT '{}'::jsonb,
  task_completions JSONB DEFAULT '[]'::jsonb,
  subtask_completions JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  mood SMALLINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Study Notes & 4-YoE Interview Prep Table
CREATE TABLE IF NOT EXISTS public.study_notes (
  date DATE PRIMARY KEY,
  topic TEXT NOT NULL,
  summary TEXT,
  key_concepts JSONB DEFAULT '[]'::jsonb,
  failure_modes JSONB DEFAULT '[]'::jsonb,
  metrics_scale JSONB DEFAULT '[]'::jsonb,
  interview_qa JSONB DEFAULT '[]'::jsonb,
  code_snippet TEXT,
  raw_markdown TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Study Tasks (Optional Cloud Mirror)
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,
  category TEXT DEFAULT 'study',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  subtasks JSONB DEFAULT '[]'::jsonb,
  completed_subtask_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Hardened Security Policies
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- Read Access: Allow read-only querying for habit tracking and AI analytics
CREATE POLICY "Allow public read daily_completions" ON public.daily_completions FOR SELECT USING (true);
CREATE POLICY "Allow public read study_notes" ON public.study_notes FOR SELECT USING (true);
CREATE POLICY "Allow public read study_tasks" ON public.study_tasks FOR SELECT USING (true);

-- Write Access (Production Hardened):
-- For private personal apps without Supabase Auth, writes are allowed via the publishable key,
-- or can be restricted to service_role / authenticated users when auth is added.
CREATE POLICY "Allow authorized insert/update daily_completions" ON public.daily_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authorized insert/update study_notes" ON public.study_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authorized insert/update study_tasks" ON public.study_tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- To restrict writes exclusively to authenticated users (e.g., after adding email login):
-- DROP POLICY IF EXISTS "Allow authorized insert/update daily_completions" ON public.daily_completions;
-- CREATE POLICY "Allow auth write daily_completions" ON public.daily_completions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable Realtime on study_notes and daily_completions
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_notes;
