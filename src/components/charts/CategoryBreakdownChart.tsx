import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CategoryStats } from '../../utils/analytics';

const CATEGORY_COLORS: Record<string, string> = {
  Study: '#3b82f6',
  Practice: '#10b981',
  Review: '#f59e0b',
  'Spaced Review': '#8b5cf6',
  'Mock Exam': '#ef4444',
};

interface CategoryBreakdownChartProps {
  data: CategoryStats[];
  height?: number;
}

export function CategoryBreakdownChart({ data, height = 250 }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p className="text-muted text-center py-8">No category data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-[{height}px]">
      <h3 className="text-sm font-semibold text-strong mb-3">Completion by Category</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
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
            formatter={(value: number, name: string) => {
              const item = data.find(d => d.category === name);
              if (!item) return [value, name];
              return [`${value}% (${item.completed}/${item.total})`, name];
            }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarWidth={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with stats */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        {data.map((entry) => (
          <div key={entry.category} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#6b7280' }} />
            <span className="font-medium text-strong">{entry.category}</span>
            <span className="text-muted ml-auto">{entry.completed}/{entry.total} ({entry.rate}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}