import { StudyTask } from '../types';
import { getDayNumber, formatFriendlyDate } from './date';

/**
 * Generates an in-depth, structured prompt for any AI (ChatGPT, Claude, Grok, Cursor)
 * based on the user's specific tasks for that day.
 */
export function generateDayStudyPrompt(dateStr: string, tasks: StudyTask[]): string {
  const dayNum = getDayNumber(dateStr);
  const friendlyDate = formatFriendlyDate(dateStr);

  const taskListText = tasks
    .map((t, idx) => {
      const cleanDesc = (t.description || '').trim();
      return `${idx + 1}. **[${t.category.toUpperCase()}] ${t.title}** (${t.durationMinutes} min)\n   - Deliverable: ${cleanDesc}`;
    })
    .join('\n\n');

  return `You are a Principal Google Cloud Data Engineering Architect and Technical Interviewer.

I am preparing for senior Google Cloud Data Engineering roles and the GCP Professional Data Engineer certification.
Today is **Day ${dayNum} of 61 (${friendlyDate})**.

Here is my daily study curriculum and deliverables:

${taskListText}

---

### Please structure your response as a comprehensive, ready-to-save Markdown (.md) study document covering these 4 sections:

## 1. Documentation & Architecture Deep Dive (Learn Task)
- Synthesize the official Google Cloud documentation and architectural best practices for today's topic.
- Explain the under-the-hood storage vs. compute mechanics, partition/sharding strategies, and pricing/quota tradeoffs.
- Detail **2 real-world failure modes or anti-patterns** (e.g. data skew, catchup storms, OOMs, or cost overruns) and how to mitigate them.

## 2. Step-by-Step Hands-on Implementation (Hands-on Task)
- Provide exact, step-by-step instructions to implement and verify today's lab deliverables.
- Include runnable \`gcloud\` CLI commands, configuration YAMLs, or deployment steps.
- Explain how to verify success and one common error encountered during deployment with the fix.

## 3. Python, SQL & Technical Drills
- **Python Drill:** Complete, production-grade Python script with type hints, error handling, and step-by-step explanation of the logic, complexity, and design choices.
- **SQL Drill:** Optimized BigQuery SQL query (using window functions / CTEs). Explain step-by-step why it is performant and avoids unnecessary partition scans.
- **Senior Interview Q&A:** 3 tough, realistic interview questions on today's concepts with concise, articulate answers that demonstrate trade-offs and battle-tested experience.

## 4. Summary Takeaway & Checklist
- A concise 3-bullet recap of what I must remember for interviews.

Format the entire output as clean Markdown with syntax-highlighted code blocks so I can save it directly as \`notes/${dateStr}.md\`.`;
}
