import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { WeeklyTrendPoint } from '../utils/analytics';

interface WeeklyTrendChartProps {
  data: WeeklyTrendPoint[];
  height?: number;
}

export function WeeklyTrendChart({ data, height = 250 }: WeeklyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p className="text-muted text-center py-8">No data available yet</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(d => ({
    ...d,
    weekShort: d.weekLabel,
  }));

  return (
    <div className="chart-container h-[{height}px]">
      <h3 className="text-sm font-semibold text-strong mb-3">Weekly Completion Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="weekShort"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
            formatter={(value: number) => [`${value}%`, 'Completion Rate']}
          />
          <Line
            type="monotone"
            dataKey="completionRate"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="completionRate"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Mini legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          Completion Rate
        </span>
      </div>
    </div>
  );
}