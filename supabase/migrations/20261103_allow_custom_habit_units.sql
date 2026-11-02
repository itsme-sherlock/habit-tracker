-- The app lets habits use any unit (e.g. 'questions', 'glasses'); the old check rejected them.
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_unit_check;
