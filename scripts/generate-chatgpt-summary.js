const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/gcpCurriculum.ts'), 'utf8');
const startIdx = content.indexOf('export const GCP_CURRICULUM');
const equalsIdx = content.indexOf('=', startIdx);
const arrayStart = content.indexOf('[', equalsIdx);
const arrayEnd = content.indexOf('] as Omit', arrayStart) + 1;
const tasks = JSON.parse(content.slice(arrayStart, arrayEnd));

let md = `# 60-Day GCP Data Engineer Study Plan (Nov 1 - Dec 31, 2026)\n\n`;
md += `This document contains the complete daily curriculum for 60-day Google Cloud Data Engineer preparation.\n\n`;
md += `## How to Use with ChatGPT\n`;
md += `- **Check Status / Schedule:** Ask "What is my syllabus for Day 17?" or "What should I study on 2026-11-17?"\n`;
md += `- **Catch-Up:** Ask "I fell behind and missed Day 1 to Day 5. Give me a 3-day catch-up schedule."\n`;
md += `- **Deep Dives & Quizzes:** Ask "Quiz me on today's hands-on topic: Airflow DAG retries and backfills."\n\n`;
md += `---\n\n`;

const daysMap = {};
tasks.forEach((t) => {
  if (!daysMap[t.date]) daysMap[t.date] = [];
  daysMap[t.date].push(t);
});

const sortedDates = Object.keys(daysMap).sort();
sortedDates.forEach((d, idx) => {
  const dayNum = idx + 1;
  md += `### Day ${dayNum} — ${d}\n`;
  daysMap[d].forEach((task) => {
    const cleanDesc = (task.description || '').replace(/\n+/g, ' ');
    md += `- **[${task.category.toUpperCase()}] ${task.title}** (${task.durationMinutes}m)\n  ${cleanDesc}\n`;
  });
  md += `\n`;
});

fs.writeFileSync(path.join(__dirname, '../GCP_60DAY_PLAN_SUMMARY.md'), md);
console.log('Successfully created GCP_60DAY_PLAN_SUMMARY.md with', sortedDates.length, 'days.');
