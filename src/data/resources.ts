import type { StudyTask } from '../types';
import { PLAN_RESOURCES, GCP_CURRICULUM } from './gcpCurriculum';
import { PRODUCTION_RESOURCES } from './productionPlan';

export interface TaskResource {
  label: string;
  url: string;
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const docs = (q: string) => `https://cloud.google.com/s/results?q=${encodeURIComponent(q)}`;

const lc = (slug: string, label: string): TaskResource => ({ label: `LeetCode: ${label}`, url: `https://leetcode.com/problems/${slug}/` });
const bq = (path: string, label: string): TaskResource => ({ label: `Docs: ${label}`, url: `https://cloud.google.com/bigquery/docs/${path}` });

// Ordered easy -> hard. LeetCode lists are served 2 at a time; short doc lists are shown whole.
const SQL_PATTERNS: Record<string, TaskResource[]> = {
  'joins + aggregations': [
    lc('combine-two-tables', 'Combine Two Tables (Easy)'),
    lc('customers-who-never-order', 'Customers Who Never Order (Easy)'),
    lc('employees-earning-more-than-their-managers', 'Employees Earning More Than Their Managers (Easy)'),
    lc('average-time-of-process-per-machine', 'Average Time of Process per Machine (Easy)'),
    lc('managers-with-at-least-5-direct-reports', 'Managers with at Least 5 Direct Reports (Medium)'),
    lc('department-highest-salary', 'Department Highest Salary (Medium)'),
  ],
  'window functions': [
    lc('second-highest-salary', 'Second Highest Salary (Medium)'),
    lc('game-play-analysis-iii', 'Game Play Analysis III (Medium)'),
    lc('rank-scores', 'Rank Scores (Medium)'),
    lc('nth-highest-salary', 'Nth Highest Salary (Medium)'),
    lc('restaurant-growth', 'Restaurant Growth (Medium)'),
    lc('department-top-three-salaries', 'Department Top Three Salaries (Hard)'),
  ],
  'ctes + subqueries': [
    lc('duplicate-emails', 'Duplicate Emails (Easy)'),
    lc('employees-earning-more-than-their-managers', 'Employees Earning More Than Their Managers (Easy)'),
    lc('managers-with-at-least-5-direct-reports', 'Managers with at Least 5 Direct Reports (Medium)'),
    lc('department-highest-salary', 'Department Highest Salary (Medium)'),
    lc('last-person-to-fit-in-the-bus', 'Last Person to Fit in the Bus (Medium)'),
    lc('restaurant-growth', 'Restaurant Growth (Medium)'),
  ],
  'dedup (latest record per key)': [
    lc('duplicate-emails', 'Duplicate Emails (Easy)'),
    lc('delete-duplicate-emails', 'Delete Duplicate Emails (Easy)'),
    lc('product-price-at-a-given-date', 'Product Price at a Given Date (Medium)'),
    lc('immediate-food-delivery-ii', 'Immediate Food Delivery II (Medium)'),
    lc('department-highest-salary', 'Department Highest Salary (Medium)'),
    lc('department-top-three-salaries', 'Department Top Three Salaries (Hard)'),
  ],
  'gaps and islands': [
    lc('consecutive-numbers', 'Consecutive Numbers (Medium)'),
    lc('find-the-start-and-end-number-of-continuous-ranges', 'Continuous Ranges (Medium)'),
    lc('human-traffic-of-stadium', 'Human Traffic of Stadium (Hard)'),
    lc('report-contiguous-dates', 'Report Contiguous Dates (Hard)'),
  ],
  'merge + incremental loads': [
    { label: 'Docs: BigQuery MERGE statement', url: 'https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax#merge_statement' },
    lc('delete-duplicate-emails', 'Delete Duplicate Emails (DML practice)'),
  ],
  'scd type 1/2': [
    { label: 'Reference: Slowly changing dimension (types 1-6)', url: 'https://en.wikipedia.org/wiki/Slowly_changing_dimension' },
    { label: 'Docs: BigQuery MERGE statement', url: 'https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax#merge_statement' },
  ],
  'partition pruning + query cost': [
    bq('querying-partitioned-tables', 'Querying partitioned tables'),
    bq('best-practices-costs', 'Controlling query costs'),
    bq('query-plan-explanation', 'Query plan and timeline'),
  ],
};

// A pattern's n-th appearance in the plan gets progressively harder problems.
const SQL_PRACTICE: Record<string, TaskResource[]> = (() => {
  const SQL_RE = /SQL \(\d+ min\): 2 problems on ([^|]+?)\s*\|/;
  const days = GCP_CURRICULUM
    .filter(t => t.category === 'review')
    .map(t => ({ date: t.date, pattern: t.description?.match(SQL_RE)?.[1].trim().toLowerCase() }))
    .filter((d): d is { date: string; pattern: string } => Boolean(d.pattern && SQL_PATTERNS[d.pattern]))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totals: Record<string, number> = {};
  days.forEach(d => { totals[d.pattern] = (totals[d.pattern] ?? 0) + 1; });

  const seen: Record<string, number> = {};
  const out: Record<string, TaskResource[]> = {};
  for (const { date, pattern } of days) {
    const list = SQL_PATTERNS[pattern];
    const occurrence = seen[pattern] ?? 0;
    seen[pattern] = occurrence + 1;
    if (list.length <= 3) {
      out[`${date}|review`] = list;
      continue;
    }
    const steps = Math.floor(list.length / 2);
    const step = Math.min(steps - 1, Math.floor((occurrence * steps) / totals[pattern]));
    out[`${date}|review`] = list.slice(step * 2, step * 2 + 2);
  }
  return out;
})();

// Plan tasks use the curated links from the spreadsheet; anything else gets search links.
export function getTaskResources(task: Pick<StudyTask, 'title' | 'category' | 'date'>): TaskResource[] {
  const key = `${task.date}|${task.category}`;
  const curated = PLAN_RESOURCES[key] ?? PRODUCTION_RESOURCES[key];
  const sql = SQL_PRACTICE[key];
  if (sql?.length) return [...sql, ...(curated ?? [])];
  if (curated?.length) return curated;

  const topic = task.title
    .replace(/^(Learn|Hands-on|Practice|Review)\s*:\s*/i, '')
    .replace(/^\[\w+\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (task.category === 'review' || task.category === 'mock-exam') {
    return [
      { label: 'Data engineer interview questions (YouTube)', url: yt('GCP data engineer interview questions and answers') },
      { label: 'SQL practice (YouTube)', url: yt('SQL interview questions window functions joins') },
      { label: 'Official exam guide', url: 'https://cloud.google.com/learn/certification/data-engineer' },
    ];
  }

  if (task.category === 'practice') {
    return [
      { label: 'Hands-on walkthrough (YouTube)', url: yt(`${topic} GCP tutorial hands-on`) },
      { label: 'Google Cloud Skills Boost labs', url: `https://www.cloudskillsboost.google/catalog?keywords=${encodeURIComponent(topic)}` },
      { label: 'Docs & quickstarts', url: docs(`${topic} quickstart`) },
    ];
  }

  return [
    { label: 'Video lesson (YouTube)', url: yt(`${topic} Google Cloud explained`) },
    { label: 'Official docs', url: docs(topic) },
    { label: 'Exam-focused (YouTube)', url: yt(`${topic} GCP Professional Data Engineer exam`) },
  ];
}
