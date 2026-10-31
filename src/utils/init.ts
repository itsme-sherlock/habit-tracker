// Initialization script to pre-populate GCP curriculum data on first run
import { getHabits, addHabit, getTasksForDateRange, bulkAddStudyTasks, getSettings, saveSettings } from '../services/db';
import { getCurriculumTasks, DEFAULT_HABITS } from '../data/gcpCurriculum';
import { GCP_PREP_START, GCP_PREP_END } from '../utils/date';

export async function initializeApp(): Promise<void> {
  // Check if already initialized
  const settings = await getSettings();
  if (settings.initialized) {
    return;
  }

  console.log('Initializing app with GCP Data Engineer curriculum...');

  // Add default habits
  for (const habit of DEFAULT_HABITS) {
    await addHabit(habit);
  }

  // Add curriculum tasks for Nov 1 - Dec 31
  const curriculumTasks = getCurriculumTasks();
  await bulkAddStudyTasks(curriculumTasks);

  // Mark as initialized
  await saveSettings({ ...settings, initialized: true });

  console.log('Initialization complete!');
}

// Run initialization when module loads (in browser)
if (typeof window !== 'undefined') {
  // Small delay to ensure DB is ready
  setTimeout(() => {
    initializeApp().catch(console.error);
  }, 100);
}