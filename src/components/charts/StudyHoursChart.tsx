import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StudyHoursPoint } from '../../utils/analytics';

interface StudyHoursChartProps {
  data: StudyHoursPoint[];
  height?: number;
}

export function StudyHoursChart({ data, height = 250 }: StudyHoursChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p className="text-muted text-center py-8">No study hours data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-[{height}px]">
      <h3 className="text-sm font-semibold text-strong mb-3">Study Hours: Planned vs Actual</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
            formatter={(value: number, name: string) => [`${value}h`, name === 'planned' ? 'Planned' : 'Actual']}
          />
          <Area
            type="monotone"
            dataKey="planned"
            stroke="#9ca3af"
            fill="#9ca3af"
            fillOpacity={0.15}
            strokeDasharray="5 5"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-6 h-1 bg-blue-500" style={{ opacity: 0.2 }} />
          Actual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 h-1 bg-gray-400" style={{ borderTop: '1px dashed #9ca3af' }} />
          Planned
        </span>
      </div>
    </div>
  );
}