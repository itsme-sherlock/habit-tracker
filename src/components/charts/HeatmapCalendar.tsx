import type { HeatmapPoint } from '../../utils/analytics';
import { format, parseISO, startOfYear, endOfYear, startOfWeek, addDays, addWeeks, differenceInCalendarDays, isSameDay, isBefore, isAfter } from 'date-fns';

// GitHub-style color scale
const HEATMAP_COLORS = [
  '#ebedf0', // 0
  '#9be9a8', // 1-3
  '#40c463', // 4-6
  '#30a14e', // 7-9
  '#216e39', // 10+
];

function getColor(count: number): string {
  if (count === 0) return HEATMAP_COLORS[0];
  if (count <= 3) return HEATMAP_COLORS[1];
  if (count <= 6) return HEATMAP_COLORS[2];
  if (count <= 9) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
}

interface HeatmapCalendarProps {
  data: HeatmapPoint[];
  year?: number; // Default to current year
}

export function HeatmapCalendar({ data, year = new Date().getFullYear() }: HeatmapCalendarProps) {
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));

  // Get the first Sunday of the year (or the first day)
  const firstDayOfYear = startOfWeek(yearStart, { weekStartsOn: 0 }); // Sunday start for GitHub style

  // Calculate number of weeks
  const totalDays = differenceInCalendarDays(yearEnd, firstDayOfYear) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  // Build weeks data
  const weeks: { date: Date; count: number }[][] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(firstDayOfYear, w * 7 + d);
      const dateStr = format(date, 'yyyy-MM-DD');
      const count = dataMap.get(dateStr) || 0;
      week.push({ date, count });
    }
    weeks.push(week);
  }

  const CELL_SIZE = 12;
  const CELL_GAP = 2;
  const WIDTH = totalWeeks * (CELL_SIZE + CELL_GAP) + 20;
  const HEIGHT = 7 * (CELL_SIZE + CELL_GAP) + 40;

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="chart-container" style={{ width: '100%', overflowX: 'auto' }}>
      <h3 className="text-sm font-semibold text-strong mb-3">Activity Heatmap</h3>
      <svg width={WIDTH} height={HEIGHT} className="heatmap-svg">
        {/* Day labels */}
        {dayLabels.map((day, i) => (
          <text
            key={day}
            x={5}
            y={25 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            fill="#6b7280"
            className="day-label"
          >
            {day}
          </text>
        ))}

        {/* Month labels at top */}
        {monthLabels.map((month, m) => {
          const monthStart = new Date(year, m, 1);
          const weekIndex = Math.floor(differenceInCalendarDays(monthStart, firstDayOfYear) / 7);
          return (
            <text
              key={month}
              x={20 + weekIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
              y={12}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
              className="month-label"
            >
              {month}
            </text>
          );
        })}

        {/* Cells */}
        {weeks.map((week, w) => (
          <g key={w}>
            {week.map((cell, d) => {
              const isFuture = isAfter(cell.date, new Date());
              const isCurrentYear = cell.date.getFullYear() === year;

              return (
                <rect
                  key={d}
                  x={20 + w * (CELL_SIZE + CELL_GAP)}
                  y={15 + d * (CELL_SIZE + CELL_GAP)}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  ry={2}
                  fill={isFuture || !isCurrentYear ? '#e5e7eb' : getColor(cell.count)}
                  data-count={cell.count}
                  data-date={format(cell.date, 'yyyy-MM-DD')}
                  className="heatmap-cell"
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted">
        <span>Less</span>
        {HEATMAP_COLORS.map((color, i) => (
          <span
            key={i}
            className="w-3 h-3 rounded"
            style={{ backgroundColor: color }}
            title={i === 0 ? '0' : i === 1 ? '1-3' : i === 2 ? '4-6' : i === 3 ? '7-9' : '10+'}
          />
        ))}
        <span>More</span>
      </div>

      <style jsx>{`
        .heatmap-cell:hover {
          transform: scale(1.3);
          z-index: 10;
          stroke: #374151;
          stroke-width: 1;
        }
      `}</style>
    </div>
  );
}