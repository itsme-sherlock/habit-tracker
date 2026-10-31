import type { StudyTask } from '../types';
import { PLAN_RESOURCES } from './gcpCurriculum';
import { PRODUCTION_RESOURCES } from './productionPlan';

export interface TaskResource {
  label: string;
  url: string;
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const docs = (q: string) => `https://cloud.google.com/s/results?q=${encodeURIComponent(q)}`;

// Plan tasks use the curated links from the spreadsheet; anything else gets search links.
export function getTaskResources(task: Pick<StudyTask, 'title' | 'category' | 'date'>): TaskResource[] {
  const key = `${task.date}|${task.category}`;
  const curated = PLAN_RESOURCES[key] ?? PRODUCTION_RESOURCES[key];
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
