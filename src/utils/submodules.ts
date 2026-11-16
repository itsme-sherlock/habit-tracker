import { StudyTask, SubTask } from '../types';

/**
 * Parses or generates structured submodules for any study task
 */
export function getTaskSubmodules(task: StudyTask): SubTask[] {
  if (task.subtasks && task.subtasks.length > 0) {
    return task.subtasks;
  }

  const dur = task.durationMinutes || 60;

  // Review / Drills: split by '|' if present
  if (task.category === 'review' || task.category === 'mock-exam') {
    if (task.description && task.description.includes('|')) {
      const parts = task.description.split('|').map((p) => p.trim()).filter(Boolean);
      const perPart = Math.max(15, Math.round(dur / parts.length));
      return parts.map((part, idx) => ({
        id: `${task.id}_sub_${idx}`,
        title: part.replace(/^(Python|SQL|Interview)\s*\([^)]*\)\s*:\s*/i, '$1: '),
        durationMinutes: perPart,
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_${idx}`) ?? false),
      }));
    }

    return [
      {
        id: `${task.id}_sub_0`,
        title: 'Python scripting / algorithm drill',
        durationMinutes: Math.round(dur * 0.33),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_0`) ?? false),
      },
      {
        id: `${task.id}_sub_1`,
        title: 'SQL query practice (Window functions / CTEs)',
        durationMinutes: Math.round(dur * 0.33),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_1`) ?? false),
      },
      {
        id: `${task.id}_sub_2`,
        title: 'Interview questions verbal drill',
        durationMinutes: Math.round(dur * 0.34),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_2`) ?? false),
      },
    ];
  }

  // Practice / Hands-on
  if (task.category === 'practice') {
    return [
      {
        id: `${task.id}_sub_0`,
        title: 'Lab setup: Project, IAM & dataset staging',
        durationMinutes: Math.round(dur * 0.25),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_0`) ?? false),
      },
      {
        id: `${task.id}_sub_1`,
        title: 'Core pipeline implementation & execution',
        durationMinutes: Math.round(dur * 0.5),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_1`) ?? false),
      },
      {
        id: `${task.id}_sub_2`,
        title: 'Output verification & interview notes capture',
        durationMinutes: Math.round(dur * 0.25),
        completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_2`) ?? false),
      },
    ];
  }

  // Study / Learn
  return [
    {
      id: `${task.id}_sub_0`,
      title: 'Documentation & Architecture guide review',
      durationMinutes: Math.round(dur * 0.4),
      completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_0`) ?? false),
    },
    {
      id: `${task.id}_sub_1`,
      title: 'Core concepts & failure modes deep dive',
      durationMinutes: Math.round(dur * 0.35),
      completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_1`) ?? false),
    },
    {
      id: `${task.id}_sub_2`,
      title: 'Synthesis: Summary notes & flashcards',
      durationMinutes: Math.round(dur * 0.25),
      completed: task.completed || (task.completedSubtaskIds?.includes(`${task.id}_sub_2`) ?? false),
    },
  ];
}

/**
 * Calculates completed effort in minutes for a task based on its completed submodules or task completion
 */
export function getTaskCompletedEffort(task: StudyTask): number {
  if (task.completed) {
    return task.durationMinutes;
  }

  const submodules = getTaskSubmodules(task);
  const doneSubmodules = submodules.filter((s) => s.completed);
  if (doneSubmodules.length === 0) return 0;
  if (doneSubmodules.length === submodules.length) return task.durationMinutes;

  return doneSubmodules.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
}
