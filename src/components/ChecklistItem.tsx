import { Check, Plus, Minus, Circle, CheckCircle } from 'lucide-react';
import type { Habit, StudyTask } from '../types';
import { getNotificationIcon, getCategoryColor, formatDuration } from '../utils/notifications';

interface ChecklistItemProps {
  type: 'habit' | 'task';
  habit?: Habit;
  task?: StudyTask;
  completed: number; // for habits: count completed; for tasks: 0 or 1
  onToggle: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function ChecklistItem({ type, habit, task, completed, onToggle, onIncrement, onDecrement }: ChecklistItemProps) {
  if (type === 'habit' && habit) {
    const progress = Math.min((completed / habit.targetCount) * 100, 100);
    const isComplete = completed >= habit.targetCount;

    return (
      <div className="card p-4 flex items-center gap-4 animate-slide-in">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="progress-ring w-full h-full" viewBox="0 0 48 48">
            <circle
              className="text-gray-200 dark:text-gray-700"
              fill="none"
              strokeWidth="4"
              stroke="currentColor"
              cx="24"
              cy="24"
              r="20"
            />
            <circle
              className={`progress-ring-circle ${
                isComplete ? 'text-green-500' : 'text-primary-500'
              }`}
              fill="none"
              strokeWidth="4"
              strokeDasharray={`${(progress / 100) * 125.66} 125.66`}
              strokeLinecap="round"
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
            />
            {isComplete && (
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="text-green-500 text-[14px]"
              >
                ✓
              </text>
            )}
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {habit.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completed}/{habit.targetCount} {habit.unit}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            disabled={completed <= 0}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            aria-label="Decrement"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="w-10 text-center font-medium text-lg">
            {completed}
          </span>
          <button
            onClick={onIncrement}
            disabled={isComplete}
            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 disabled:opacity-50 transition-colors"
            aria-label="Increment"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
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
        </div>
      </div>
    );
  }

  return null;
}