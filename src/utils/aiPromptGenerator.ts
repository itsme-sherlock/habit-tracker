import { StudyTask } from '../types';
import { getDayNumber, formatFriendlyDate } from './date';

/**
 * Generates an in-depth, dynamic prompt for any AI (ChatGPT, Claude, Grok, Cursor)
 * based on the user's specific tasks and real-time completion state for that day.
 */
export function generateDayStudyPrompt(dateStr: string, tasks: StudyTask[]): string {
  const dayNum = getDayNumber(dateStr);
  const friendlyDate = formatFriendlyDate(dateStr);

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Format each task with its live completion status and subtasks
  const taskListText = tasks
    .map((t, idx) => {
      const statusIcon = t.completed ? '✅ [COMPLETED]' : '⏳ [PENDING]';
      const cleanDesc = (t.description || '').trim();

      let subtaskInfo = '';
      if (t.subtasks && t.subtasks.length > 0) {
        const doneSubs = (t.completedSubtaskIds || []).length;
        subtaskInfo = `\n   - Submodules: ${doneSubs}/${t.subtasks.length} done`;
        t.subtasks.forEach((s) => {
          const isSubDone = (t.completedSubtaskIds || []).includes(s.id);
          subtaskInfo += `\n     ${isSubDone ? '☑' : '☐'} ${s.title}`;
        });
      }

      return `${idx + 1}. ${statusIcon} **[${t.category.toUpperCase()}] ${t.title}** (${t.durationMinutes} min)\n   - Deliverable: ${cleanDesc}${subtaskInfo}`;
    })
    .join('\n\n');

  // Dynamic focus directive based on what is actually completed vs pending
  let statusDirective = '';
  if (completedTasks.length === tasks.length && tasks.length > 0) {
    statusDirective = `🎉 **Current Status:** I have completed all ${tasks.length} tasks for today!
Please act as a Senior Technical Interviewer: quiz me on today's concepts with 5 challenging scenario-based questions, evaluate potential edge cases, and generate comprehensive reference notes.`;
  } else if (completedTasks.length > 0) {
    const pendingNames = pendingTasks.map((t) => `"${t.title}"`).join(', ');
    statusDirective = `⚡ **Current Status:** I have completed ${completedTasks.length} of ${tasks.length} tasks today.
**Primary Focus:** Prioritize deep-dive explanations and step-by-step code for the **pending tasks**: ${pendingNames}. For the completed tasks, provide brief review summaries.`;
  } else {
    statusDirective = `🚀 **Current Status:** I am starting Day ${dayNum} fresh (0 of ${tasks.length} tasks completed).
Please provide an end-to-end guide walking me through all 3 tasks step-by-step.`;
  }

  return `You are a Principal Google Cloud Data Engineering Architect and Technical Interviewer.

I am preparing for senior Google Cloud Data Engineering roles and the GCP Professional Data Engineer certification.
Today is **Day ${dayNum} of 61 (${friendlyDate})**.

${statusDirective}

---

### Today's Curriculum & Live Checklist:

${taskListText}

---

### Please structure your response as a comprehensive, ready-to-save Markdown (.md) study document covering:

## 1. Documentation & Architecture Deep Dive (Learn Task)
- Synthesize the official Google Cloud documentation and architectural best practices for today's topic.
- Explain under-the-hood storage vs. compute mechanics, partition/sharding strategies, and pricing/quota tradeoffs.
- Detail **2 real-world failure modes or anti-patterns** (e.g. data skew, catchup storms, OOMs, or cost overruns) and how to mitigate them.

## 2. Step-by-Step Hands-on Implementation (Hands-on Task)
- Provide exact, step-by-step instructions to implement and verify today's lab deliverables.
- Include runnable \`gcloud\` CLI commands, configuration YAMLs, or deployment steps.
- Explain how to verify success and one common error encountered during deployment with the fix.

## 3. Python, SQL & Technical Drills
- **Python Drill:** Complete, production-grade Python script with type hints, error handling, and step-by-step explanation of the logic, complexity, and why this design was chosen.
- **SQL Drill:** Optimized BigQuery SQL query (using window functions / CTEs). Explain step-by-step why it is performant and avoids table scans.
- **Senior Interview Q&A:** 3 tough interview questions on today's concepts with concise answers highlighting real production trade-offs.

## 4. Summary Takeaway & Checklist
- A concise 3-bullet recap of what I must remember for interviews.

Format the entire output as clean Markdown with syntax-highlighted code blocks so I can save it directly as \`notes/${dateStr}.md\`.`;
}
