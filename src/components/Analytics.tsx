import { useAnalytics } from '../hooks/useAnalytics';
import {
  WeeklyTrendChart,
  CategoryBreakdownChart,
  StudyHoursChart,
  StreakCard,
  HeatmapCalendar,
  ReadinessGauge,
} from './charts';
import { RefreshCw, TrendingUp } from 'lucide-react';

export function Analytics() {
  const { data, loading, error, refresh } = useAnalytics();

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        </div>
        {/* Skeleton placeholders */}
        <div className="card h-64" />
        <div className="card h-64" />
        <div className="card h-32" />
        <div className="card h-80" />
        <div className="card h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
        <button onClick={refresh} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const avgRate = weeklyTrend.length > 0
    ? Math.round(weeklyTrend.reduce((sum, w) => sum + w.completionRate, 0) / weeklyTrend.length)
    : 0;
  const totalHours = studyHours.reduce((sum, w) => sum + w.actual, 0);

  if (!data) {
    return (
      <div className="p-4 text-center text-muted">
        No analytics data available
      </div>
    );
  }

  const { weeklyTrend, categoryStats, studyHours, streak, heatmap, readinessScore } = data;

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <button onClick={refresh} className="icon-button" aria-label="Refresh analytics">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Readiness Score - Prominent at top */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-strong">Exam Readiness</h2>
            <p className="text-sm text-muted">Weighted score based on your progress</p>
          </div>
          <ReadinessGauge score={readinessScore} size={140} />
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-strong">{weeklyTrend.length}</div>
            <div className="text-xs text-muted">Weeks Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-strong">{avgRate}%</div>
            <div className="text-xs text-muted">Avg Weekly Completion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-strong">{streak.current}</div>
            <div className="text-xs text-muted">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-strong">{totalHours.toFixed(1)}h</div>
            <div className="text-xs text-muted">Total Hours Studied</div>
          </div>
        </div>
      </div>

      {/* Weekly Trend + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <WeeklyTrendChart data={weeklyTrend} height={300} />
        </div>
        <div className="card p-4">
          <CategoryBreakdownChart data={categoryStats} height={300} />
        </div>
      </div>

      {/* Study Hours */}
      <div className="card p-4">
        <StudyHoursChart data={studyHours} height={280} />
      </div>

      {/* Streak Cards */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-strong mb-3">Streak Stats</h3>
        <StreakCard data={streak} />
      </div>

      {/* Heatmap */}
      <div className="card p-4">
        <HeatmapCalendar data={heatmap} />
      </div>

      {/* Category Detail Table */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-strong mb-3">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b">
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Completed</th>
                <th className="pb-2 font-medium text-right">Total</th>
                <th className="pb-2 font-medium text-right">Rate</th>
                <th className="pb-2 font-medium text-right">Hours Done</th>
                <th className="pb-2 font-medium text-right">Hours Planned</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat) => (
                <tr key={stat.category} className="border-b border-b-gray-100 dark:border-gray-800">
                  <td className="py-2 font-medium">{stat.category}</td>
                  <td className="py-2 text-right">{stat.completed}</td>
                  <td className="py-2 text-right text-muted">{stat.total}</td>
                  <td className="py-2 text-right font-medium text-strong">{stat.rate}%</td>
                  <td className="py-2 text-right">{stat.hoursCompleted}h</td>
                  <td className="py-2 text-right text-muted">{stat.hoursPlanned}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}