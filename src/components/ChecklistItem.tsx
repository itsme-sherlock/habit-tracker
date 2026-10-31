import { Check, Plus, Minus } from 'lucide-react';
import type { Habit, StudyTask } from '../types';
import { TaskResources } from './TaskResources';
import { getNotificationIcon, getCategoryColor, formatDuration } from '../utils/notifications';

interface ChecklistItemProps {
  type: 'habit' | 'task';
  habit?: Habit;
  task?: StudyTask;
  completed: number; // for habits: count completed; for tasks: 0 or 1
  onToggle: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  menu?: React.ReactNode;
}

export function ChecklistItem({ type, habit, task, completed, onToggle, onIncrement, onDecrement, menu }: ChecklistItemProps) {
  if (type === 'habit' && habit) {
    const progress = Math.min((completed / habit.targetCount) * 100, 100);
    const isComplete = completed >= habit.targetCount;

    return (
      <div className="habit-row animate-slide-in w-full">
        <div className="relative w-10 h-10 flex-shrink-0" aria-hidden="true">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle className="ring-track" fill="none" strokeWidth="5" cx="24" cy="24" r="20" />
            <circle
              fill="none"
              strokeWidth="5"
              strokeDasharray={`${(progress / 100) * 125.66} 125.66`}
              strokeLinecap="round"
              cx="24"
              cy="24"
              r="20"
              style={{ stroke: isComplete ? 'var(--success)' : 'var(--accent)', transition: 'stroke-dasharray 0.4s ease' }}
            />
          </svg>
          {isComplete && <Check className="absolute inset-0 m-auto w-5 h-5" style={{ color: 'var(--success)' }} strokeWidth={3} />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="habit-name">{habit.name}</h3>
          <p className="habit-meta tabular-nums" aria-live="polite">
            {completed}/{habit.targetCount} {habit.unit}
          </p>
        </div>

        <div className="stepper" role="group" aria-label={`${habit.name} progress`}>
          <button onClick={onDecrement} disabled={completed <= 0} aria-label={`Decrease ${habit.name}`}>
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <button onClick={onIncrement} disabled={isComplete} aria-label={`Increase ${habit.name}`} className="stepper-add">
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {menu}
      </div>
    );
  }

  if (type === 'task' && task) {
    const isComplete = completed > 0 || task.completed;

    return (
      <div
        className={`card p-4 flex items-start gap-4 animate-slide-in ${
          isComplete ? 'opacity-60 bg-green-50 dark:bg-green-900/20' : ''
        }`}
      >
        <button
          onClick={onToggle}
          className={`relative w-6 h-6 flex-shrink-0 mt-0.5 rounded border-2 transition-colors ${
            isComplete
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
        >
          {isComplete && (
            <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium truncate ${isComplete ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </h3>
            <span className={getCategoryColor(task.category)}>
              {getNotificationIcon(task.category)} {task.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDuration(task.durationMinutes)}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <TaskResources task={task} />
        </div>
      </div>
    );
  }

  return null;
}