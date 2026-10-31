import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GCP_CURRICULUM } from '../src/data/gcpCurriculum';
import { PRODUCTION_CURRICULUM } from '../src/data/productionPlan';

// Runs from a Vercel cron (see vercel.json) and pushes today's plan to the phone via ntfy.sh.
// Env: NTFY_TOPIC (required, keep it unguessable), CRON_SECRET (recommended), NTFY_SERVER (optional).

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function todayIST(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    return res.status(500).json({ error: 'NTFY_TOPIC is not configured' });
  }

  const date = typeof req.query.date === 'string' && secret ? req.query.date : todayIST();
  const tasks = GCP_CURRICULUM.concat(PRODUCTION_CURRICULUM).filter(t => t.date === date);
  if (tasks.length === 0) {
    return res.status(200).json({ sent: false, reason: `No plan for ${date}` });
  }

  const totalMin = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const learn = tasks.find(t => t.category === 'study');
  const focus = learn?.title.replace(/^Learn:\s*/, '') ?? 'Today\'s plan';
  const lines = tasks.map(t => `• ${t.title} (${Math.round(t.durationMinutes)} min)`);
  const body = `${lines.join('\n')}\n\nTotal: ${(totalMin / 60).toFixed(1)} h`;

  const server = process.env.NTFY_SERVER || 'https://ntfy.sh';
  const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;

  const headers: Record<string, string> = {
    // HTTP headers must be latin-1, so keep the title ASCII-safe.
    Title: `Study plan ${date}: ${focus}`.replace(/[^\x20-\x7E]/g, ''),
    Tags: 'books',
    Priority: '4',
  };
  if (appUrl) headers.Click = appUrl;

  const r = await fetch(`${server}/${encodeURIComponent(topic)}`, { method: 'POST', headers, body });
  if (!r.ok) {
    return res.status(502).json({ error: `ntfy responded ${r.status}` });
  }
  return res.status(200).json({ sent: true, date, tasks: tasks.length });
}
