import { useState, useEffect, useCallback } from 'react';
import { getTasksForDateRange, getCompletionsForRange } from '../services/db';
import { getAnalyticsData, type AnalyticsData } from '../utils/analytics';
import { PLAN_START, PLAN_END } from '../data/gcpCurriculum';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all tasks and completions for the plan date range
      const [tasks, completions] = await Promise.all([
        getTasksForDateRange(PLAN_START, PLAN_END),
        getCompletionsForRange(PLAN_START, PLAN_END),
      ]);

      const analytics = getAnalyticsData(tasks, completions, PLAN_START, PLAN_END);
      setData(analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    data,
    loading,
    error,
    refresh: loadAnalytics,
  };
}