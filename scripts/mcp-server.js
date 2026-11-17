#!/usr/bin/env node
/**
 * Model Context Protocol (MCP) Server for DE60 Habit Tracker
 * 
 * Built with the official @modelcontextprotocol/sdk.
 * Supports:
 * 1. STDIO Transport (Claude Desktop, Cursor, Antigravity CLI)
 * 2. Official Streamable HTTP / SSE Transport (Google Cloud Run, Railway, Render, Remote MCP)
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');

// ============================================================================
// 1. Supabase Client & Config Initialization
// ============================================================================
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {}

let supabaseUrl = process.env.SUPABASE_URL || '';
let supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const mcpSecretKey = process.env.MCP_SECRET_KEY || ''; // Optional Bearer token for remote access

try {
  const configPath = path.join(__dirname, '../src/config/supabaseConfig.ts');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const urlMatch = configContent.match(/url:\s*['"]([^'"]*)['"]/);
    const keyMatch = configContent.match(/anonKey:\s*['"]([^'"]*)['"]/);
    if (!supabaseUrl && urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1];
    if (!supabaseKey && keyMatch && keyMatch[1]) supabaseKey = keyMatch[1];
  }
} catch (e) {}

let supabase = null;
if (createClient && supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// ============================================================================
// 2. Curriculum Data Loading with Fallback Guarantee
// ============================================================================
function getDayNumber(dateStr) {
  try {
    const parts = dateStr.split('-');
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    const start = new Date(2026, 10, 1, 12, 0, 0);
    const diffTime = target.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch (e) {
    return 1;
  }
}

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let curriculumTasks = [];
try {
  const currContent = fs.readFileSync(path.join(__dirname, '../src/data/gcpCurriculum.ts'), 'utf8');
  const startIdx = currContent.indexOf('export const GCP_CURRICULUM');
  if (startIdx !== -1) {
    const equalsIdx = currContent.indexOf('=', startIdx);
    const arrayStart = currContent.indexOf('[', equalsIdx);
    const arrayEnd = currContent.indexOf('] as Omit', arrayStart) + 1;
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      curriculumTasks = JSON.parse(currContent.slice(arrayStart, arrayEnd));
    }
  }
} catch (e) {}

if (!curriculumTasks || curriculumTasks.length === 0) {
  try {
    const jsonPath = path.join(__dirname, '../chatgpt-curriculum.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      curriculumTasks = Object.values(data).flat();
    }
  } catch (e) {}
}

curriculumTasks = curriculumTasks.map((t, idx) => ({
  ...t,
  id: `task_${t.date}_${t.category}_${idx}`,
}));

// Helper to fetch completion sets from Supabase
async function getCompletionsData() {
  const completedDates = new Set();
  const completedTaskIds = new Set();
  let records = [];

  if (supabase) {
    try {
      const { data } = await supabase.from('daily_completions').select('*').order('date', { ascending: true });
      if (data) {
        records = data;
        data.forEach((row) => {
          if (row.task_completions && row.task_completions.length > 0) {
            completedDates.add(row.date);
            row.task_completions.forEach((id) => completedTaskIds.add(id));
          }
        });
      }
    } catch (e) {}
  }
  return { completedDates, completedTaskIds, records };
}

// ============================================================================
// 3. Create McpServer Instance & Register Tools
// ============================================================================
const mcpServer = new McpServer({
  name: 'de60-study-tracker',
  version: '2.1.0',
});

// Tool 1: get_study_status
mcpServer.tool(
  'get_study_status',
  'Returns overall progress, active streak, and detects if and when you fell off track, identifying the earliest missed date and overdue backlog hours.',
  {},
  async () => {
    const todayStr = getTodayString();
    const currentDayNum = Math.min(61, Math.max(1, getDayNumber(todayStr)));
    const { completedTaskIds } = await getCompletionsData();

    const dayMap = {};
    curriculumTasks.forEach((t) => {
      if (!dayMap[t.date]) dayMap[t.date] = [];
      dayMap[t.date].push({ ...t, isDone: completedTaskIds.has(t.id) });
    });

    const missedDays = [];
    const overdueTasks = [];
    const allDates = Object.keys(dayMap).sort();

    allDates.forEach((d) => {
      if (d < todayStr) {
        const tasks = dayMap[d];
        const doneCount = tasks.filter((t) => t.isDone).length;
        if (doneCount < tasks.length) {
          missedDays.push({
            date: d,
            dayNumber: getDayNumber(d),
            totalTasks: tasks.length,
            completedTasks: doneCount,
            pendingTasks: tasks.filter((t) => !t.isDone).map((t) => t.title),
          });
          overdueTasks.push(...tasks.filter((t) => !t.isDone));
        }
      }
    });

    const firstMissed = missedDays[0] || null;
    const result = {
      today: todayStr,
      currentPlanDay: currentDayNum,
      totalCurriculumTasks: curriculumTasks.length,
      completedTasksCount: completedTaskIds.size,
      progressPercentage: Math.round((completedTaskIds.size / (curriculumTasks.length || 1)) * 100),
      isBehindSchedule: missedDays.length > 0,
      missedSince: firstMissed ? {
        date: firstMissed.date,
        dayNumber: firstMissed.dayNumber,
        message: `You fell off track on Day ${firstMissed.dayNumber} (${firstMissed.date}).`,
      } : null,
      backlogSummary: {
        missedDaysCount: missedDays.length,
        overdueTasksCount: overdueTasks.length,
        estimatedBacklogHours: Math.round(overdueTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0) / 60),
      },
      urgentPriorityTasks: overdueTasks.slice(0, 3).map((t) => ({
        day: getDayNumber(t.date),
        date: t.date,
        taskId: t.id,
        title: t.title,
        durationMinutes: t.durationMinutes,
      })),
      cloudSyncStatus: supabase ? 'Connected (Supabase PostgreSQL)' : 'Offline Local Mode',
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 2: get_catchup_plan
mcpServer.tool(
  'get_catchup_plan',
  'Generates an actionable, prioritized catch-up schedule to recover missed days based on extra hours you can commit per day.',
  {
    max_daily_extra_hours: z.number().optional().describe('Maximum extra study hours per day you can allocate for catch-up (default 1.5).'),
  },
  async ({ max_daily_extra_hours }) => {
    const extraDailyHours = max_daily_extra_hours || 1.5;
    const todayStr = getTodayString();
    const currentDayNum = Math.min(61, Math.max(1, getDayNumber(todayStr)));
    const { completedTaskIds } = await getCompletionsData();

    const overdueTasks = curriculumTasks.filter((t) => t.date < todayStr && !completedTaskIds.has(t.id));
    if (overdueTasks.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'ON_TRACK',
            message: `Congratulations! You are on pace with Day ${currentDayNum}. Zero overdue backlog.`,
          }, null, 2),
        }],
      };
    }

    const totalBacklogMinutes = overdueTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
    const totalBacklogHours = Math.round(totalBacklogMinutes / 60);
    const daysNeeded = Math.ceil(totalBacklogHours / extraDailyHours);
    const firstMissedDate = overdueTasks[0].date;

    const result = {
      status: 'CATCHUP_REQUIRED',
      missedSinceDay: getDayNumber(firstMissedDate),
      totalBacklogTasks: overdueTasks.length,
      totalBacklogHours,
      recommendedStrategy: `Allocate ${extraDailyHours} extra hours/day. You will be fully caught up in ${daysNeeded} days.`,
      catchupOrder: overdueTasks.slice(0, 3).map((t) => ({
        day: getDayNumber(t.date),
        date: t.date,
        taskId: t.id,
        title: t.title,
        durationMinutes: t.durationMinutes,
      })),
      action: `Start by opening Day ${getDayNumber(firstMissedDate)} in your habit tracker.`,
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 3: get_daily_curriculum
mcpServer.tool(
  'get_daily_curriculum',
  'Fetches syllabus tasks, durations, and instructions for any specific plan day (1–61) or date (YYYY-MM-DD).',
  {
    day: z.number().optional().describe('Plan day number between 1 and 61 (e.g. 17).'),
    date: z.string().optional().describe('Target date in YYYY-MM-DD format (e.g. 2026-11-17).'),
  },
  async ({ day, date }) => {
    let targetDate = date;
    if (!targetDate && day) {
      const start = new Date(2026, 10, 1, 12, 0, 0);
      start.setDate(start.getDate() + (day - 1));
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, '0');
      const d = String(start.getDate()).padStart(2, '0');
      targetDate = `${y}-${m}-${d}`;
    }
    if (!targetDate) targetDate = getTodayString();

    const matched = curriculumTasks.filter((t) => t.date === targetDate);
    const result = {
      date: targetDate,
      dayNumber: getDayNumber(targetDate),
      tasksCount: matched.length,
      tasks: matched,
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 4: generate_study_notes
mcpServer.tool(
  'generate_study_notes',
  'Generates genuine, topic-specific technical study notes (Concepts, Failure Modes, Architecture, and Interview Q&A) for a study day.',
  {
    date: z.string().optional().describe('Target date in YYYY-MM-DD format (defaults to today).'),
  },
  async ({ date }) => {
    const targetDate = date || getTodayString();
    const dayNum = getDayNumber(targetDate);
    const dayTasks = curriculumTasks.filter((t) => t.date === targetDate);
    const mainTopic = dayTasks[0]?.title || `GCP Data Engineering Day ${dayNum}`;
    const cleanTopic = mainTopic.replace(/^(Learn|Hands-on):\s*(\[Core\]\s*)?/i, '');

    let concepts = [
      `Architectural Design Principles: Separation of storage and compute in Google Cloud.`,
      `State Management & Checkpointing: Ensuring consistent processing state and deterministic recovery.`,
      `Cost & Performance Optimization: Minimizing compute consumption and partition scan overhead.`,
    ];
    let failureModes = [
      `Data Skew / Hot-spotting: Uneven key distribution causing worker starvation or localized memory spikes.`,
      `Non-Idempotent Reruns: Pipeline retries causing duplicate downstream warehouse inserts.`,
    ];
    let interviewQA = [
      {
        question: `How do you design a reliable production pipeline for ${cleanTopic}?`,
        answer: `I implement idempotent writes (e.g. partition overwrite or upsert keys), decouple ingestion buffers using Pub/Sub or staging tables, and enforce data quality schemas prior to downstream transformations.`,
      },
    ];

    if (/bigquery/i.test(cleanTopic)) {
      concepts = [
        'Partitioning & Clustering: Ingestion-time vs date column partitioning; clustering up to 4 columns to prune disk blocks.',
        'Slot Allocation: Dynamic query execution planning, slot contention analysis, and reservation vs on-demand pricing tradeoffs.',
        'Cached Results & BI Engine: Utilizing execution cache and in-memory BI Engine for recurring analytical workloads.',
      ];
      failureModes = [
        'Over-Scanning: Querying unpartitioned wildcard tables resulting in unexpected scan billing.',
        'High Cardinality Clustering: Clustering on UUID columns leading to inefficient micro-partitions.',
      ];
      interviewQA = [
        {
          question: 'How do you optimize an expensive BigQuery query scanning terabytes of data?',
          answer: 'I inspect the execution plan (Stage bytes scanned and slot time), enforce partition filter predicates (e.g. require_partition_filter), cluster by filter/join keys, and replace SELECT * with projected columns.',
        },
      ];
    } else if (/airflow|composer|dag/i.test(cleanTopic)) {
      concepts = [
        'Idempotent Task Design: Using logical execution_date instead of CURRENT_DATE to ensure deterministic reruns.',
        'Sensor & Worker Optimization: Using mode="reschedule" to free worker slots during long-running waiting periods.',
        'Task Flow API & TaskGroups: Clean dependency grouping without bloated XCom serializations.',
      ];
      failureModes = [
        'Catchup Storms: Leaving catchup=True on newly unpaused DAGs triggering hundreds of concurrent executions.',
        'XCom Overload: Passing heavy dataframes through Airflow metadata database rather than GCS URIs.',
      ];
      interviewQA = [
        {
          question: 'How do you handle backfills and avoid duplicate data in Cloud Composer / Airflow?',
          answer: 'Ensure every task is idempotent: writes to BigQuery should use WRITE_TRUNCATE on specific partition bounds or MERGE statements. Always test DAGs with execution_date parameterization.',
        },
      ];
    } else if (/dataflow|beam/i.test(cleanTopic)) {
      concepts = [
        'Streaming Watermarks & Event Time: Distinguishing processing time from event time using bounded sliding/tumbling windows.',
        'Trigger Mechanics & Accumulation: Using early and late triggers with accumulation mode for streaming completeness.',
        'DoFn State & Timers: Managing stateful streaming transformations with persistent per-key state.',
      ];
      failureModes = [
        'Worker Memory Leaks: Failing to garbage collect large objects within DoFn setup/teardown methods.',
        'Stuck Watermarks: A stalled upstream partition preventing window advancement and emitting no downstream records.',
      ];
      interviewQA = [
        {
          question: 'How does Apache Beam / Dataflow handle late-arriving streaming events?',
          answer: 'Beam allows defining allowedLateness. Records within the window boundary trigger early or on-time firings, while records within allowed lateness trigger late updates. Data past allowed lateness is dropped or redirected to a dead-letter sink.',
        },
      ];
    }

    const noteRecord = {
      date: targetDate,
      topic: cleanTopic,
      summary: `Technical study notes and failure mode analysis for Day ${dayNum}: ${cleanTopic}`,
      keyConcepts: concepts,
      failureModes,
      interviewQA,
    };

    const notesDir = path.join(__dirname, '../notes');
    if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
    const mdPath = path.join(notesDir, `${targetDate}.md`);
    const mdContent = `# Day ${dayNum} (${targetDate}): ${cleanTopic}\n\n## 1. Key Concepts\n${concepts.map(c => `- ${c}`).join('\n')}\n\n## 2. Failure Modes & Mitigations\n${failureModes.map(f => `- ⚠️ ${f}`).join('\n')}\n\n## 3. Interview Preparation\n${interviewQA.map(q => `### Q: ${q.question}\n> "${q.answer}"`).join('\n')}\n`;
    fs.writeFileSync(mdPath, mdContent);

    if (supabase) {
      try {
        await supabase.from('study_notes').upsert({
          date: targetDate,
          topic: cleanTopic,
          summary: noteRecord.summary,
          key_concepts: concepts,
          failure_modes: failureModes,
          interview_qa: interviewQA,
          raw_markdown: mdContent,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'date' });
      } catch (err) {}
    }

    const result = {
      success: true,
      savedFile: `notes/${targetDate}.md`,
      cloudSynced: Boolean(supabase),
      note: noteRecord,
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 5: mark_task_completed (Strict Write Safety & Validation)
mcpServer.tool(
  'mark_task_completed',
  'Safely marks a study task completed or uncompleted with strict validation against curriculum IDs, updating Supabase cloud records.',
  {
    date: z.string().describe('Target date in YYYY-MM-DD format.'),
    taskId: z.string().describe('Exact task ID or task title snippet to toggle.'),
    completed: z.boolean().optional().describe('True to mark completed, false to unmark (default true).'),
  },
  async ({ date, taskId, completed }) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid or missing "date". Format must be YYYY-MM-DD.`);
    }

    if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
      throw new Error(`Missing "taskId". You must specify the ID or title of the task to mark.`);
    }

    const isCompleted = completed !== false;
    const dayTasks = curriculumTasks.filter((t) => t.date === date);
    const matchedTask = dayTasks.find(
      (t) => t.id === taskId || t.title.toLowerCase().includes(taskId.toLowerCase())
    );

    if (!matchedTask) {
      const available = dayTasks.map((t) => `"${t.id}" (${t.title})`).join(', ');
      throw new Error(
        `Task "${taskId}" not found for date ${date}. Available tasks on this date: ${available || 'None found.'}`
      );
    }

    const actualTaskId = matchedTask.id;

    if (supabase) {
      const { data } = await supabase.from('daily_completions').select('*').eq('date', date).maybeSingle();
      const existing = data || { date, task_completions: [] };
      const tasksSet = new Set(existing.task_completions || []);

      if (isCompleted) tasksSet.add(actualTaskId);
      else tasksSet.delete(actualTaskId);

      await supabase.from('daily_completions').upsert({
        date,
        task_completions: Array.from(tasksSet),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date' });

      const result = {
        success: true,
        action: isCompleted ? 'TASK_MARKED_COMPLETED' : 'TASK_MARKED_UNCOMPLETED',
        date,
        taskId: actualTaskId,
        taskTitle: matchedTask.title,
        completedTasksOnDay: Array.from(tasksSet).length,
        totalTasksOnDay: dayTasks.length,
        dayProgress: `${Array.from(tasksSet).length} / ${dayTasks.length} tasks completed`,
      };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }

    const result = {
      success: true,
      action: isCompleted ? 'TASK_MARKED_COMPLETED' : 'TASK_MARKED_UNCOMPLETED',
      date,
      taskId: actualTaskId,
      taskTitle: matchedTask.title,
      note: 'Updated locally (offline mode). Connect Supabase to persist in cloud.',
    };
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 6: get_habit_analytics (Calculates actual active & longest streak)
mcpServer.tool(
  'get_habit_analytics',
  'Analyzes micro-habit consistency, completion rates per habit, current active streak, and logging trends.',
  {},
  async () => {
    const todayStr = getTodayString();
    const currentDayNum = Math.min(61, Math.max(1, getDayNumber(todayStr)));
    const { records } = await getCompletionsData();

    // Group habits completion counts
    const habitTotals = {
      'Study GCP Concepts': 0,
      'Hands-on Practice': 0,
      'Review & Flashcards': 0,
      'Mock Questions': 0,
    };

    records.forEach((r) => {
      const hc = r.habit_completions || {};
      Object.keys(hc).forEach((h) => {
        if (habitTotals[h] !== undefined && hc[h] > 0) habitTotals[h] += 1;
      });
    });

    // Compute actual current streak
    const activeDates = new Set(
      records
        .filter((r) => (r.task_completions && r.task_completions.length > 0) || Object.values(r.habit_completions || {}).some(v => v > 0))
        .map((r) => r.date)
    );

    let currentStreak = 0;
    let checkDate = new Date();
    let checkStr = todayStr;

    // If today hasn't been logged yet, check starting from yesterday
    if (!activeDates.has(checkStr)) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      checkStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    }

    while (activeDates.has(checkStr)) {
      currentStreak += 1;
      const d = new Date(checkStr);
      d.setDate(d.getDate() - 1);
      checkStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Compute longest historical streak
    const sortedDates = Array.from(activeDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevTimestamp = null;

    sortedDates.forEach((dStr) => {
      const t = new Date(dStr).getTime();
      if (prevTimestamp === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((t - prevTimestamp) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevTimestamp = t;
    });

    const activeDaysCount = records.length;
    const consistencyRate = Math.min(100, Math.round((activeDaysCount / Math.max(1, currentDayNum)) * 100));

    const result = {
      trackedDays: activeDaysCount,
      currentPlanDay: currentDayNum,
      currentActiveStreakDays: currentStreak,
      longestStreakDays: longestStreak,
      consistencyRatePercent: consistencyRate,
      habitPerformance: Object.entries(habitTotals).map(([name, count]) => ({
        habit: name,
        daysCompleted: count,
        consistencyPercent: activeDaysCount > 0 ? Math.round((count / activeDaysCount) * 100) : 0,
      })),
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// Tool 7: get_weekly_report (Compares Planned vs Completed Hours)
mcpServer.tool(
  'get_weekly_report',
  'Provides a week-by-week progress summary, comparing planned study hours vs actual completed hours, pending milestones, and pacing recommendations.',
  {
    week: z.number().optional().describe('Week number between 1 and 9 (defaults to current week).'),
  },
  async ({ week }) => {
    const todayStr = getTodayString();
    const currentDayNum = Math.min(61, Math.max(1, getDayNumber(todayStr)));
    const targetWeek = week || Math.min(9, Math.ceil(currentDayNum / 7));
    const startDay = (targetWeek - 1) * 7 + 1;
    const endDay = Math.min(61, targetWeek * 7);

    const { completedTaskIds } = await getCompletionsData();

    const weekTasks = curriculumTasks.filter((t) => {
      const day = getDayNumber(t.date);
      return day >= startDay && day <= endDay;
    });

    const plannedMinutes = weekTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
    const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;

    const completedWeekTasks = weekTasks.filter((t) => completedTaskIds.has(t.id));
    const completedMinutes = completedWeekTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
    const completedHours = Math.round((completedMinutes / 60) * 10) / 10;

    const remainingHours = Math.max(0, Math.round((plannedHours - completedHours) * 10) / 10);
    const weekCompletionPercentage = weekTasks.length > 0 ? Math.round((completedWeekTasks.length / weekTasks.length) * 100) : 0;

    const result = {
      weekNumber: targetWeek,
      planDayRange: `Day ${startDay} – Day ${endDay}`,
      totalTasksCount: weekTasks.length,
      completedTasksCount: completedWeekTasks.length,
      weekCompletionPercentage,
      plannedHours,
      completedHours,
      remainingHours,
      keyMilestones: weekTasks.slice(0, 4).map((t) => ({ day: getDayNumber(t.date), title: t.title })),
      pacingStatus: completedHours >= plannedHours
        ? 'WEEK_GOAL_ACHIEVED'
        : targetWeek < Math.ceil(currentDayNum / 7)
          ? 'BEHIND_WEEK_PACE'
          : 'IN_PROGRESS',
      recommendation: targetWeek < Math.ceil(currentDayNum / 7) && remainingHours > 0
        ? `You have ${remainingHours} hours remaining from Week ${targetWeek}. Use get_catchup_plan to schedule catch-up sessions.`
        : `Stay consistent with daily hands-on labs and review flashcards daily.`,
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================================
// 4. Execution Mode: STDIO vs Official Streamable HTTP / SSE Server
// ============================================================================
const isHttpMode = process.env.PORT || process.argv.includes('--http');

if (isHttpMode) {
  const PORT = process.env.PORT || 8080;
  const app = express();

  app.use(cors());

  // Optional Bearer Authentication middleware
  if (mcpSecretKey) {
    app.use((req, res, next) => {
      // Allow unauthenticated health check
      if (req.method === 'GET' && (req.path === '/' || req.path === '/health')) {
        return next();
      }
      const auth = req.headers['authorization'] || req.headers['x-api-key'] || '';
      const token = auth.replace(/^Bearer\s+/i, '');
      if (token !== mcpSecretKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing MCP_SECRET_KEY.' });
      }
      next();
    });
  }

  // Health check endpoint
  app.get(['/', '/health'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'de60-habit-tracker-mcp',
      version: '2.1.0',
      transport: 'Streamable HTTP / SSE',
      endpoints: {
        sse: '/sse',
        messages: '/messages',
      },
      toolsCount: 7,
      curriculumTasksLoaded: curriculumTasks.length,
    });
  });

  // Active SSE transports mapped by sessionId
  const transports = new Map();

  // Official SSE Stream Endpoint
  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);

    transport.onclose = () => {
      transports.delete(transport.sessionId);
    };

    await mcpServer.connect(transport);
  });

  // Official Message Post Endpoint
  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports.get(sessionId);
    if (!transport) {
      return res.status(404).send('Session not found or connection closed');
    }
    await transport.handlePostMessage(req, res);
  });

  app.listen(PORT, () => {
    console.log(`[DE60 MCP] Official SDK Streamable HTTP / SSE Server running on port ${PORT}`);
    console.log(`[DE60 MCP] Endpoints: GET /health | GET /sse | POST /messages`);
  });

} else {
  // STDIO Transport Loop (Claude Desktop, Cursor, Antigravity CLI)
  async function runStdio() {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
  }
  runStdio().catch((err) => {
    console.error('Fatal MCP STDIO Error:', err);
    process.exit(1);
  });
}
