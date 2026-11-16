#!/usr/bin/env node
/**
 * IDE-to-App AI Study Assistant
 * Connects your IDE to your DE60 mobile habit tracker & Supabase cloud database.
 * 
 * Usage:
 *   node scripts/study-ai.js today
 *   node scripts/study-ai.js notes [dayNum | YYYY-MM-DD]
 *   node scripts/study-ai.js push-note <date> <file.json>
 */

const fs = require('fs');
const path = require('path');

// Try loading @supabase/supabase-js
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  // Will run in local file mode if not found
}

// Load Supabase config from src/config/supabaseConfig.ts or env
let supabaseUrl = process.env.SUPABASE_URL || '';
let supabaseKey = process.env.SUPABASE_ANON_KEY || '';

try {
  const configContent = fs.readFileSync(path.join(__dirname, '../src/config/supabaseConfig.ts'), 'utf8');
  const urlMatch = configContent.match(/url:\s*['"]([^'"]*)['"]/);
  const keyMatch = configContent.match(/anonKey:\s*['"]([^'"]*)['"]/);
  if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1];
  if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1];
} catch (e) {}

let supabase = null;
if (createClient && supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// 4-YoE Technical Reference Templates for GCP Data Engineering
const KNOWLEDGE_BASE = {
  'bigquery': {
    concepts: [
      'Capacitor Columnar Format: Encodes columns with run-length, dictionary, and bit-packed compression. Prunes unreferenced columns before scanning.',
      'Borg Compute Slots: Dynamic slot allocator. On-demand queries compete for a pool of shared slots; BigQuery Editions provide dedicated slot reservations with autoscaling.',
      'Partitioning vs Clustering: Partitioning divides tables physically by ingestion time or DATE column (max 4,000 partitions). Clustering sorts data by up to 4 columns within partitions for block-level skipping.'
    ],
    failures: [
      'Slot Starvation & Execution Spill to Disk: Complex multi-way joins with unpartitioned data exhaust available slots; intermediate stages spill to persistent shuffle disk, causing query latency to spike from 10s to 30 mins.',
      'Partition Pruning Failure: Wrapping a partitioned column in a SQL function (e.g. `WHERE DATE(timestamp_col) = ...` instead of `WHERE timestamp_col >= ...`) causes BigQuery to perform a full table scan, multiplying cost 50x.'
    ],
    metrics: [
      'Scanned volume reduced from 14 TB to 120 GB per run using ingestion-date partitioning and clustering on `user_id, status`.',
      'Average monthly BigQuery spend optimized by 38% after implementing reservation commitments with 100 baseline slots and 200 autoscale ceiling.'
    ],
    interviewQA: [
      {
        question: 'How do you optimize a query scanning multiple terabytes in BigQuery?',
        answer: 'First, check execution details in INFORMATION_SCHEMA.JOBS to see slot usage and spilled bytes. Apply DATE partitioning to restrict scanned blocks, cluster by high-cardinality filter columns, avoid SELECT *, and pre-filter with CTEs before heavy joins.'
      },
      {
        question: 'When would you choose BigQuery Editions over on-demand pricing?',
        answer: 'When query patterns are steady, predictable, or exceed $10,000/month in on-demand scanning costs ($6.25/TB). Editions (Standard, Enterprise, Enterprise Plus) allow reserved slot commitments, budget caps, and autoscaling slots with VPC service controls.'
      }
    ]
  },
  'dataflow': {
    concepts: [
      'Unified Apache Beam Model: PCollections and PTransforms provide unified semantics for both bounded (batch) and unbounded (streaming) streams.',
      'Event Time vs Processing Time: Watermarks track the progress of event time. Triggers control when speculative, on-time, or late results are emitted from windows.',
      'Exactly-Once Semantics: Supported natively via Cloud Dataflow shuffle service and state/timer deduplication.'
    ],
    failures: [
      'Unbounded Pipeline Memory Leak due to Late Data Accumulation: Allowing infinite `allowedLateness` with accumulating triggers retains window state in memory indefinitely, causing worker OOM crashes.',
      'Pub/Sub Acknowledgment Timeout causing Infinite Re-delivery Loops: Heavy transformations blocking worker threads cause Pub/Sub ack deadlines to expire, flooding the pipeline with duplicate messages.'
    ],
    metrics: [
      'P95 end-to-end streaming latency maintained at < 12 seconds across 80,000 events/sec peak ingestion.',
      'Autoscaling from 3 to 18 n2-standard-4 Dataflow workers based on CPU utilization and backlog backlog time.'
    ],
    interviewQA: [
      {
        question: 'How does Dataflow handle late-arriving data in a streaming pipeline?',
        answer: 'Dataflow uses watermarks to establish a threshold between on-time and late data. By setting `.withAllowedLateness(Duration)`, late data arriving after the watermark triggers an updated pane emission before the window state is permanently dropped.'
      }
    ]
  },
  'airflow': {
    concepts: [
      'Idempotent DAG Design: Every task must be re-runnable without changing the final state. Use partitioned staging tables and MERGE/upsert statements rather than raw appends.',
      'Airflow GCP Operators: `BigQueryInsertJobOperator`, `DataprocSubmitJobOperator`, `GCSToBigQueryOperator`. Avoid running data processing inside Airflow worker processes.',
      'Backfill and Catchup Mechanics: Configure `catchup=False` for scheduled batch pipelines to prevent avalanche job executions upon activation.'
    ],
    failures: [
      'Airflow Worker Out-Of-Memory (OOM): Pulling large query results into Python XCom memory (`xcom_push`) crashes the metadata database and celery worker nodes.',
      'Deadlocks in Sensor Tasks: Using `mode="poke"` on dozens of file-check sensors hogs all worker execution slots, starving downstream execution tasks.'
    ],
    metrics: [
      'Orchestrated 45 production DAGs spanning 280 tasks across BigQuery, Dataproc, and dbt with 99.8% SLA compliance by 6:00 AM daily.',
      'Sensor slot starvation reduced to zero by migrating all long-polling tasks to `mode="reschedule"`.'
    ],
    interviewQA: [
      {
        question: 'How do you guarantee idempotency in Airflow pipelines?',
        answer: 'Never rely on plain INSERT statements. Use execution date parameters `{{ ds }}` to write to deterministic partition targets, stage data in temporary tables, and execute atomic MERGE statements or partition replacements (`WRITE_TRUNCATE`).'
      }
    ]
  }
};

async function main() {
  const command = process.argv[2] || 'today';

  if (command === 'today' || command === 'status') {
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n========================================`);
    console.log(`  DE60 IDE-to-App AI Assistant`);
    console.log(`========================================`);
    console.log(`Today's Date: ${today}`);
    console.log(`Supabase Sync: ${supabase ? 'CONNECTED' : 'LOCAL MODE (Set SUPABASE_URL & ANON_KEY to sync)'}\n`);
    return;
  }

  if (command === 'notes') {
    const targetDate = process.argv[3] || new Date().toISOString().split('T')[0];
    console.log(`\nGenerating 4-YoE Production Study Notes for: ${targetDate}...`);

    const noteRecord = {
      date: targetDate,
      topic: 'GCP BigQuery & Dataflow Production Architecture',
      summary: 'Production mechanics for BigQuery slot allocation, partitioning optimization, and Apache Beam streaming watermarks.',
      keyConcepts: KNOWLEDGE_BASE.bigquery.concepts,
      failureModes: KNOWLEDGE_BASE.bigquery.failures,
      metricsScale: KNOWLEDGE_BASE.bigquery.metrics,
      interviewQA: KNOWLEDGE_BASE.bigquery.interviewQA,
      codeSnippet: `-- Optimized BigQuery MERGE with Partition Pruning\nMERGE INTO dataset.fact_events T\nUSING dataset.stg_events S\nON T.event_date = S.event_date AND T.event_id = S.event_id\nWHEN MATCHED THEN UPDATE SET T.updated_at = CURRENT_TIMESTAMP(), T.payload = S.payload\nWHEN NOT MATCHED THEN INSERT (event_date, event_id, payload, created_at)\nVALUES (S.event_date, S.event_id, S.payload, CURRENT_TIMESTAMP());`,
      updatedAt: Date.now()
    };

    const mdContent = `# Day ${targetDate}: ${noteRecord.topic}

> **Level**: 4-Year Experienced GCP Data Engineer Reference  
> **Date**: ${targetDate}  
> **Summary**: ${noteRecord.summary}

---

## 1. Internal Architecture & Core Concepts
${noteRecord.keyConcepts.map(c => `- **${c.split(':')[0]}**: ${c.split(':').slice(1).join(':').trim()}`).join('\n')}

---

## 2. Production Failure Modes & War Stories (4 YoE)
${noteRecord.failureModes.map(f => `### ⚠️ ${f.split(':')[0]}\n${f.split(':').slice(1).join(':').trim()}`).join('\n\n')}

---

## 3. Production Scale & Metrics Benchmarks
${noteRecord.metricsScale.map(m => `- ${m}`).join('\n')}

---

## 4. Top 4-YoE Interview Questions & Spoken Answers
${noteRecord.interviewQA.map((qa, i) => `### Q${i+1}: ${qa.question}\n**Spoken Answer:**\n> "${qa.answer}"`).join('\n\n')}

---

## 5. Production Code / SQL Blueprint
\`\`\`sql
${noteRecord.codeSnippet}
\`\`\`
`;

    noteRecord.rawMarkdown = mdContent;

    // Save locally to notes/ as Markdown (.md)
    const notesDir = path.join(__dirname, '../notes');
    if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
    const mdFile = path.join(notesDir, `${targetDate}.md`);
    fs.writeFileSync(mdFile, mdContent);
    console.log(`✓ Saved Markdown note: notes/${targetDate}.md`);

    // Also save JSON cache
    const jsonDir = path.join(__dirname, '../study-notes');
    if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });
    fs.writeFileSync(path.join(jsonDir, `${targetDate}.json`), JSON.stringify(noteRecord, null, 2));

    // Push to Supabase if connected
    if (supabase) {
      console.log(`Pushing to Supabase table: study_notes...`);
      const { error } = await supabase.from('study_notes').upsert({
        date: noteRecord.date,
        topic: noteRecord.topic,
        summary: noteRecord.summary,
        key_concepts: noteRecord.keyConcepts,
        failure_modes: noteRecord.failureModes,
        metrics_scale: noteRecord.metricsScale,
        interview_qa: noteRecord.interviewQA,
        code_snippet: noteRecord.codeSnippet,
        raw_markdown: noteRecord.rawMarkdown,
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });

      if (error) {
        console.error('Supabase error:', error.message);
      } else {
        console.log(`✓ Synced successfully to Supabase (including raw Markdown)!`);
      }
    } else {
      console.log(`ℹ Notice: Connect Supabase in Settings to view cloud notes directly on your phone.`);
    }
  }
}

main().catch(console.error);
