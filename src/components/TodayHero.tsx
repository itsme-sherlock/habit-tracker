import { differenceInCalendarDays, parseISO } from 'date-fns';
import { PLAN_START, PLAN_END } from '../data/gcpCurriculum';

interface TodayHeroProps {
  selectedDate: string;
  overallProgress: number;
  completedHabits: number;
  totalHabits: number;
  completedTasks: number;
  totalTasks: number;
  studiedMinutes: number;
  plannedMinutes: number;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function hours(minutes: number): string {
  return (minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1);
}

function planLabel(date: string): string {
  const d = parseISO(date);
  const total = differenceInCalendarDays(parseISO(PLAN_END), parseISO(PLAN_START)) + 1;
  const offset = differenceInCalendarDays(d, parseISO(PLAN_START));
  if (offset < 0) {
    const n = -offset;
    return n === 1 ? 'Plan starts tomorrow' : `Plan starts in ${n} days`;
  }
  if (offset >= total) return 'Plan complete';
  return `Day ${offset + 1} of ${total}`;
}

export function TodayHero(props: TodayHeroProps) {
  const { overallProgress, completedHabits, totalHabits, completedTasks, totalTasks, studiedMinutes, plannedMinutes } = props;
  const dash = (overallProgress / 100) * CIRCUMFERENCE;

  const stats = [
    { label: 'Habits', value: `${completedHabits}/${totalHabits}` },
    { label: 'Tasks', value: `${completedTasks}/${totalTasks}` },
    { label: 'Studied', value: `${hours(studiedMinutes)}h` },
    { label: 'Planned', value: `${hours(plannedMinutes)}h` },
  ];

  return (
    <section aria-label="Daily progress" className="surface-hero dashboard-hero">
      <div className="dashboard-hero-copy">
        <p>{planLabel(props.selectedDate)}</p>
        <h1>Make steady progress.</h1>
        <p>Keep your habits and study sessions moving forward.</p>
      </div>
      <div
        className="relative dashboard-progress-ring flex-shrink-0"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={overallProgress}
        aria-label="Overall completion"
      >
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" className="ring-track" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            className="ring-value"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="dashboard-progress-value text-3xl font-bold tabular-nums">{overallProgress}%</span>
          <span className="dashboard-progress-label text-xs">complete</span>
        </div>
      </div>

      <div className="min-w-0">
        <dl className="dashboard-stat-grid">
          {stats.map(s => (
            <div key={s.label} className="dashboard-stat">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="text-lg font-semibold tabular-nums text-strong">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
