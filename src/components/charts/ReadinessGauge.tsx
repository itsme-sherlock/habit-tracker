interface ReadinessGaugeProps {
  score: number; // 0-100
  size?: number;
}

export function ReadinessGauge({ score, size = 160 }: ReadinessGaugeProps) {
  const RADIUS = size / 2 - 16;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dash = (score / 100) * CIRCUMFERENCE;

  // Color based on score
  let strokeColor = '#ef4444'; // red
  let label = 'Needs Work';
  if (score >= 80) {
    strokeColor = '#10b981'; // green
    label = 'Exam Ready';
  } else if (score >= 60) {
    strokeColor = '#f59e0b'; // amber
    label = 'On Track';
  } else if (score >= 40) {
    strokeColor = '#f97316'; // orange
    label = 'Behind';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90" aria-hidden="true">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            className="ring-track"
            stroke="#e5e7eb"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            stroke={strokeColor}
            className="ring-value"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-strong">{score}</span>
          <span className="text-xs text-muted mt-1">Readiness</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${strokeColor}20`,
            color: strokeColor
          }}
        >
          {label}
        </span>
      </div>

      <div className="mt-3 text-xs text-muted text-center max-w-xs">
        Weighted by: completion (40%), recency (20%), practice ratio (20%), mock exams (20%)
      </div>
    </div>
  );
}