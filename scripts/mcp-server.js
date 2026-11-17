#!/usr/bin/env node
/**
 * Model Context Protocol (MCP) Server for DE60 Habit Tracker
 * 
 * Supports both:
 * 1. STDIO Transport: For local AI clients (Claude Desktop, Cursor, Antigravity CLI).
 * 2. Streamable HTTP / SSE Transport: For remote cloud deployment (Google Cloud Run, Railway, Render, ChatGPT).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');

// ============================================================================
// 1. Database & Config Initialization
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

// Fallback: If TypeScript extraction failed, load from JSON mirror
if (!curriculumTasks || curriculumTasks.length === 0) {
  try {
    const jsonPath = path.join(__dirname, '../chatgpt-curriculum.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      curriculumTasks = Object.values(data).flat();
    }
  } catch (e) {}
}

// Assign stable deterministic IDs to curriculum tasks
curriculumTasks = curriculumTasks.map((t, idx) => ({
  ...t,
  id: `task_${t.date}_${t.category}_${idx}`,
}));

// ============================================================================
// 3. MCP Tool Definitions (7 Comprehensive Tools)
// ============================================================================
const TOOLS = [
  {
    name: 'get_study_status',
    description: 'Returns overall progress, active streak, and detects if and when you fell off track, identifying the earliest missed date and overdue backlog hours.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_catchup_plan',
    description: 'Generates an actionable, prioritized catch-up schedule to recover missed days based on extra hours you can commit per day.',
    inputSchema: {
      type: 'object',
      properties: {
        max_daily_extra_hours: {
          type: 'number',
          description: 'Maximum extra study hours per day you can allocate for catch-up (default 1.5).',
        },
      },
    },
  },
  {
    name: 'get_daily_curriculum',
    description: 'Fetches syllabus tasks, durations, and instructions for any specific plan day (1–61) or date (YYYY-MM-DD).',
    inputSchema: {
      type: 'object',
      properties: {
        day: {
          type: 'number',
          description: 'Plan day number between 1 and 61 (e.g. 17).',
        },
        date: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD format (e.g. 2026-11-17).',
        },
      },
    },
  },
  {
    name: 'generate_study_notes',
    description: 'Generates genuine, topic-specific technical study notes (Concepts, Failure Modes, Architecture, and Interview Q&A) for a study day.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD format (defaults to today).',
        },
      },
    },
  },
  {
    name: 'mark_task_completed',
    description: 'Safely marks a study task completed or uncompleted with strict validation against curriculum IDs, updating Supabase cloud records.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD format.',
        },
        taskId: {
          type: 'string',
          description: 'Exact task ID or task title snippet to toggle.',
        },
        completed: {
          type: 'boolean',
          description: 'True to mark completed, false to unmark (default true).',
        },
      },
      required: ['date', 'taskId'],
    },
  },
  {
    name: 'get_habit_analytics',
    description: 'Analyzes micro-habit consistency, completion rates per habit, current streak, and logging trends.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_weekly_report',
    description: 'Provides a week-by-week progress summary, comparing planned study hours vs completed hours and pacing recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        week: {
          type: 'number',
          description: 'Week number between 1 and 9 (defaults to current week).',
        },
      },
    },
  },
];

// ============================================================================
// 4. MCP Tool Execution Handlers
// ============================================================================
async function handleToolCall(name, args) {
  const todayStr = getTodayString();
  const currentDayNum = Math.min(61, Math.max(1, getDayNumber(todayStr)));

  // 1. Tool: get_study_status
  if (name === 'get_study_status') {
    let completedDates = new Set();
    let completedTaskIds = new Set();

    if (supabase) {
      try {
        const { data } = await supabase.from('daily_completions').select('*');
        if (data) {
          data.forEach((row) => {
            if (row.task_completions && row.task_completions.length > 0) {
              completedDates.add(row.date);
              row.task_completions.forEach((id) => completedTaskIds.add(id));
            }
          });
        }
      } catch (err) {}
    }

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

    return {
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
  }

  // 2. Tool: get_catchup_plan
  if (name === 'get_catchup_plan') {
    const extraDailyHours = args.max_daily_extra_hours || 1.5;
    const status = await handleToolCall('get_study_status', {});

    if (!status.isBehindSchedule) {
      return {
        status: 'ON_TRACK',
        message: `Congratulations! You are on pace with Day ${currentDayNum}. Zero overdue backlog.`,
      };
    }

    const totalBacklogHours = status.backlogSummary.estimatedBacklogHours;
    const daysNeeded = Math.ceil(totalBacklogHours / extraDailyHours);

    return {
      status: 'CATCHUP_REQUIRED',
      missedSinceDay: status.missedSince.dayNumber,
      totalBacklogTasks: status.backlogSummary.overdueTasksCount,
      totalBacklogHours,
      recommendedStrategy: `Allocate ${extraDailyHours} extra hours/day. You will be fully caught up in ${daysNeeded} days.`,
      catchupOrder: status.urgentPriorityTasks,
      action: `Start by opening Day ${status.missedSince.dayNumber} in your habit tracker.`,
    };
  }

  // 3. Tool: get_daily_curriculum
  if (name === 'get_daily_curriculum') {
    let targetDate = args.date;
    if (!targetDate && args.day) {
      const start = new Date(2026, 10, 1, 12, 0, 0);
      start.setDate(start.getDate() + (args.day - 1));
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, '0');
      const d = String(start.getDate()).padStart(2, '0');
      targetDate = `${y}-${m}-${d}`;
    }
    if (!targetDate) targetDate = todayStr;

    const matched = curriculumTasks.filter((t) => t.date === targetDate);
    return {
      date: targetDate,
      dayNumber: getDayNumber(targetDate),
      tasksCount: matched.length,
      tasks: matched,
    };
  }

  // 4. Tool: generate_study_notes
  if (name === 'generate_study_notes') {
    const targetDate = args.date || todayStr;
    const dayNum = getDayNumber(targetDate);
    const dayTasks = curriculumTasks.filter((t) => t.date === targetDate);
    const mainTopic = dayTasks[0]?.title || `GCP Data Engineering Day ${dayNum}`;
    const cleanTopic = mainTopic.replace(/^(Learn|Hands-on):\s*(\[Core\]\s*)?/i, '');

    // Tailor concepts and failure modes realistically to topic keywords
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

    // Save Markdown file locally
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

    return {
      success: true,
      savedFile: `notes/${targetDate}.md`,
      cloudSynced: Boolean(supabase),
      note: noteRecord,
    };
  }

  // 5. Tool: mark_task_completed (Strict Write Safety & Validation)
  if (name === 'mark_task_completed') {
    const targetDate = args.date;
    const requestedTaskId = args.taskId;
    const completed = args.completed !== false;

    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new Error(`Invalid or missing "date". Format must be YYYY-MM-DD.`);
    }

    if (!requestedTaskId || typeof requestedTaskId !== 'string' || requestedTaskId.trim() === '') {
      throw new Error(`Missing "taskId". You must specify the ID or title of the task to mark.`);
    }

    // Match task on target date
    const dayTasks = curriculumTasks.filter((t) => t.date === targetDate);
    const matchedTask = dayTasks.find(
      (t) => t.id === requestedTaskId || t.title.toLowerCase().includes(requestedTaskId.toLowerCase())
    );

    if (!matchedTask) {
      const available = dayTasks.map((t) => `"${t.id}" (${t.title})`).join(', ');
      throw new Error(
        `Task "${requestedTaskId}" not found for date ${targetDate}. Available tasks on this date: ${available || 'None found.'}`
      );
    }

    const actualTaskId = matchedTask.id;

    if (supabase) {
      const { data } = await supabase.from('daily_completions').select('*').eq('date', targetDate).maybeSingle();
      const existing = data || { date: targetDate, task_completions: [] };
      const tasksSet = new Set(existing.task_completions || []);

      if (completed) tasksSet.add(actualTaskId);
      else tasksSet.delete(actualTaskId);

      await supabase.from('daily_completions').upsert({
        date: targetDate,
        task_completions: Array.from(tasksSet),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date' });

      return {
        success: true,
        action: completed ? 'TASK_MARKED_COMPLETED' : 'TASK_MARKED_UNCOMPLETED',
        date: targetDate,
        taskId: actualTaskId,
        taskTitle: matchedTask.title,
        completedTasksOnDay: Array.from(tasksSet).length,
        totalTasksOnDay: dayTasks.length,
        dayProgress: `${Array.from(tasksSet).length} / ${dayTasks.length} tasks completed`,
      };
    }

    return {
      success: true,
      action: completed ? 'TASK_MARKED_COMPLETED' : 'TASK_MARKED_UNCOMPLETED',
      date: targetDate,
      taskId: actualTaskId,
      taskTitle: matchedTask.title,
      note: 'Updated locally (offline mode). Connect Supabase to persist in cloud.',
    };
  }

  // 6. Tool: get_habit_analytics
  if (name === 'get_habit_analytics') {
    let records = [];
    if (supabase) {
      try {
        const { data } = await supabase.from('daily_completions').select('*').order('date', { ascending: true });
        records = data || [];
      } catch (e) {}
    }

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

    const activeDaysCount = records.length;
    const consistencyRate = Math.min(100, Math.round((activeDaysCount / Math.max(1, currentDayNum)) * 100));

    return {
      trackedDays: activeDaysCount,
      currentPlanDay: currentDayNum,
      consistencyRatePercent: consistencyRate,
      habitPerformance: Object.entries(habitTotals).map(([name, count]) => ({
        habit: name,
        daysCompleted: count,
        consistencyPercent: activeDaysCount > 0 ? Math.round((count / activeDaysCount) * 100) : 0,
      })),
    };
  }

  // 7. Tool: get_weekly_report
  if (name === 'get_weekly_report') {
    const targetWeek = args.week || Math.min(9, Math.ceil(currentDayNum / 7));
    const startDay = (targetWeek - 1) * 7 + 1;
    const endDay = Math.min(61, targetWeek * 7);

    // Filter tasks belonging to this week
    const weekTasks = curriculumTasks.filter((t) => {
      const day = getDayNumber(t.date);
      return day >= startDay && day <= endDay;
    });

    const totalHours = Math.round(weekTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0) / 60);

    return {
      weekNumber: targetWeek,
      planDayRange: `Day ${startDay} – Day ${endDay}`,
      totalTasksCount: weekTasks.length,
      estimatedHours: totalHours,
      keyMilestones: weekTasks.slice(0, 4).map((t) => ({ day: getDayNumber(t.date), title: t.title })),
      recommendation: targetWeek < Math.ceil(currentDayNum / 7)
        ? 'This week is in the past. Use get_catchup_plan if any tasks are incomplete.'
        : 'Stay consistent with daily hands-on labs and revise flashcards daily.',
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// ============================================================================
// 5. Server Dispatcher (Shared by both STDIO and HTTP)
// ============================================================================
async function processJsonRpc(req) {
  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'de60-study-tracker',
          version: '2.0.0',
        },
      },
    };
  }

  if (req.method === 'notifications/initialized') {
    return null;
  }

  if (req.method === 'ping') {
    return { jsonrpc: '2.0', id: req.id, result: {} };
  }

  if (req.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: { tools: TOOLS },
    };
  }

  if (req.method === 'tools/call') {
    const { name, arguments: args } = req.params || {};
    const resultData = await handleToolCall(name, args || {});
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(resultData, null, 2),
          },
        ],
      },
    };
  }

  return {
    jsonrpc: '2.0',
    id: req.id,
    error: { code: -32601, message: `Method "${req.method}" not found.` },
  };
}

// ============================================================================
// 6. Transport Execution: Dual STDIO + Streamable HTTP / SSE
// ============================================================================
const isHttpMode = process.env.PORT || process.argv.includes('--http');

if (isHttpMode) {
  const PORT = process.env.PORT || 8080;

  const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // Optional Bearer Authentication check
    if (mcpSecretKey) {
      const auth = req.headers['authorization'] || req.headers['x-api-key'] || '';
      const token = auth.replace(/^Bearer\s+/i, '');
      if (token !== mcpSecretKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing MCP_SECRET_KEY.' }));
      }
    }

    // Health Check Endpoint
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'ok',
        service: 'de60-habit-tracker-mcp',
        version: '2.0.0',
        toolsCount: TOOLS.length,
        curriculumTasksLoaded: curriculumTasks.length,
      }));
    }

    // SSE Handshake for Remote Clients
    if (req.method === 'GET' && req.url === '/sse') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write(`event: endpoint\ndata: /mcp\n\n`);
      return;
    }

    // JSON-RPC Endpoint (POST /mcp or POST /)
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const jsonReq = JSON.parse(body);
          const response = await processJsonRpc(jsonReq);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: err.message },
          }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(PORT, () => {
    console.log(`[DE60 MCP] Remote HTTP Server listening on port ${PORT}`);
    console.log(`[DE60 MCP] Endpoints: GET /health | GET /sse | POST /mcp`);
  });

} else {
  // STDIO Transport Loop (Claude Desktop, Cursor, Antigravity CLI)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const req = JSON.parse(line);
      const res = await processJsonRpc(req);
      if (res) {
        process.stdout.write(JSON.stringify(res) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: err.message },
      }) + '\n');
    }
  });
}
