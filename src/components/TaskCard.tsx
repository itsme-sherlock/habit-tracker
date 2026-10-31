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
        {task.description && (
          <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{task.description}</p>
        )}
        <TaskResources task={task} />
      </div>
    </article>
  );
}
