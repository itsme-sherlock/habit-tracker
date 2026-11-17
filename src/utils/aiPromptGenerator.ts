import { StudyTask } from '../types';
import { getDayNumber, formatFriendlyDate } from './date';

/**
 * Generates an interactive, step-by-step coaching prompt for ChatGPT, Claude, or Grok.
 * Instructs the AI to guide the user through tasks ONE BY ONE in the chat,
 * pausing after each milestone rather than dumping a wall of text.
 */
export function generateDayStudyPrompt(dateStr: string, tasks: StudyTask[]): string {
  const dayNum = getDayNumber(dateStr);
  const friendlyDate = formatFriendlyDate(dateStr);

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Format task list with checkboxes
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

  // Determine starting point based on checkmarks
  let startingDirective = '';
  if (completedTasks.length === tasks.length && tasks.length > 0) {
    startingDirective = `👉 **START NOW:** I have already completed all 3 tasks for today! Act as a Senior Technical Interviewer: ask me **Question 1** of a 5-question senior mock interview on today's topics and wait for my answer before continuing.`;
  } else if (completedTasks.length > 0) {
    const nextPending = pendingTasks[0] || tasks[0];
    startingDirective = `👉 **START NOW:** I have already finished ${completedTasks.length} task(s). Start directly with **Milestone: "${nextPending.title}"**. Walk me through the first step and pause for my response!`;
  } else {
    startingDirective = `👉 **START NOW:** Welcome me to Day ${dayNum} and present **ONLY Milestone 1: Learn & Core Concepts ("${tasks[0]?.title || 'Core Architecture'}")**. Synthesize the documentation and gotchas, then **PAUSE and ask me if I am ready for the hands-on lab**. Do NOT output the hands-on code yet!`;
  }

  return `You are my personal 1-on-1 Google Cloud Data Engineering Mentor and Senior Architect.

I am preparing for senior GCP Data Engineering roles and the GCP Professional Data Engineer certification.
Today is **Day ${dayNum} of 61 (${friendlyDate})**.

---

### ⚠️ CRITICAL INSTRUCTION ON HOW WE WILL INTERACT:
**DO NOT dump all answers, code, or a full study guide at once in a single wall of text!**
Instead, act as an **interactive tutor** and work through today's deliverables **WITH ME, ONE STEP AT A TIME**:

1. **Step 1: Learn & Core Concepts (Milestone 1)**
   - Explain the official documentation and under-the-hood architecture for today's topic (storage vs. compute, partitioning, quotas, cost tradeoffs).
   - Detail **2 real-world failure modes** (e.g. catchup storms, data skew, OOMs, or billing overruns).
   - 🛑 **PAUSE HERE:** Ask me a quick comprehension question or ask if I'm ready to begin the hands-on lab. Wait for my reply before proceeding!

2. **Step 2: Hands-on Implementation (Milestone 2)**
   - When I say ready, walk me through the hands-on practice step-by-step.
   - Give me the exact runnable code or CLI commands, explain what each step does, and show me how to verify it succeeded.
   - 🛑 **PAUSE HERE:** Check if I ran it successfully or encountered any errors before moving on.

3. **Step 3: Python, SQL & Interview Drills (Milestone 3)**
   - Walk me through the Python and SQL drill step-by-step, explaining the logic, complexity, and why this design was chosen.
   - Drill me with 3 realistic senior interview questions on today's concepts.

4. **Final Step: Consolidated Notes (.md)**
   - Once we finish all milestones together in the chat, generate the complete, ready-to-save Markdown document (\`# Day ${dayNum} Study Notes\`) so I can save it as \`notes/${dateStr}.md\`.

---

### Today's Tasks & Current Checklist:

${taskListText}

---

${startingDirective}`;
}
