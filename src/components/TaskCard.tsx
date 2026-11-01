import { useState } from 'react';
import { BookOpen, Terminal, RotateCcw, FlaskConical, Check, ChevronDown, Clock } from 'lucide-react';
import type { StudyTask } from '../types';
import { formatDuration } from '../utils/notifications';
import { TaskResources } from './TaskResources';

const CATEGORY = {
  study: { label: 'Learn', Icon: BookOpen, tone: 'tone-learn' },
  practice: { label: 'Hands-on', Icon: Terminal, tone: 'tone-practice' },
  review: { label: 'Drills', Icon: RotateCcw, tone: 'tone-review' },
  'mock-exam': { label: 'Mock exam', Icon: FlaskConical, tone: 'tone-exam' },
} as const;

const subtaskKey = (taskId: string) => `subtasks:${taskId}`;

function parseSubtasks(description?: string): string[] {
  if (!description) return [];
  return description
    .split(/\n+|\s\|\s/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function loadChecked(taskId: string): number[] {
  try {
    const raw = localStorage.getItem(subtaskKey(taskId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface TaskCardProps {
  task: StudyTask;
  isComplete: boolean;
  onToggle: () => void;
}

export function TaskCard({ task, isComplete, onToggle }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const { label, Icon, tone } = CATEGORY[task.category] ?? CATEGORY.study;
  const title = task.title.replace(/^(Learn|Hands-on):\s*/, '');
  const panelId = `task-${task.id}`;
  const subtasks = parseSubtasks(task.description);
  const [checked, setChecked] = useState<number[]>(() => loadChecked(task.id));

  const toggleSubtask = (index: number) => {
    setChecked(prev => {
      const next = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      try {
        localStorage.setItem(subtaskKey(task.id), JSON.stringify(next));
      } catch {
        // storage unavailable; keep in-memory state only
      }
      return next;
    });
  };

  return (
    <article className={`surface-card task-card ${tone} ${isComplete ? 'is-done' : ''}`}>
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          role="checkbox"
          aria-checked={isComplete}
          aria-label={`${isComplete ? 'Mark incomplete' : 'Mark complete'}: ${title}`}
          className="check-target"
        >
          <span className="check-box" aria-hidden="true">
            <Check className="w-4 h-4" strokeWidth={3} />
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip-tone">
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {formatDuration(task.durationMinutes)}
            </span>
          </div>
          <h3 className={`mt-2 font-semibold leading-snug text-balance ${isComplete ? 'line-through text-muted' : 'text-strong'}`}>
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Hide details' : 'Show details and resources'}
          className="icon-button -mr-1"
        >
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div id={panelId} hidden={!open} className="px-4 pb-4 pl-[3.75rem]">
        {subtasks.length > 1 ? (
          <ul className="space-y-2">
            {subtasks.map((text, i) => {
              const done = checked.includes(i);
              return (
                <li key={i}>
                  <label className="flex items-start gap-2 text-sm leading-relaxed cursor-pointer">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleSubtask(i)}
                      className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer"
                    />
                    <span className={done ? 'line-through text-muted' : 'text-muted'}>{text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          task.description && (
            <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{task.description}</p>
          )
        )}
        <TaskResources task={task} />
      </div>
    </article>
  );
}
