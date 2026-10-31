// Generated from GCP_Data_Engineer_Final_Prep_Plan.xlsx (Timesheet sheet), 1 Nov - 31 Dec 2026.
// Each day has three tasks: Learn, Hands-on and Python/SQL/interview drills.

import type { StudyTask } from '../types';

// Bump when the plan changes so existing installs re-seed it.
export const PLAN_VERSION = 3;
export const PLAN_START = '2026-11-01';
export const PLAN_END = '2027-03-01';

export interface PlanResource {
  label: string;
  url: string;
}

export const GCP_CURRICULUM: Omit<StudyTask, 'id'>[] = [
  {
    "date": "2026-11-01",
    "title": "Learn: [Core] BigQuery architecture, partitioning, clustering",
    "description": "BigQuery docs: storage, partitioned and clustered tables",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-01",
    "title": "Hands-on: [Core] BigQuery architecture, partitioning, clustering",
    "description": "Quick setup (1 hr): project, budget alert, sample EDI files in GCS. Then partition + cluster a table; compare bytes processed before/after\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-01",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Parse CSV to dicts, validate required fields | SQL (30 min): 2 problems on joins + aggregations | Interview (30 min): answer 5 questions aloud on 'BigQuery architecture, partitioning, clustering'. | Optional: Notes: on-demand vs editions/slots",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-02",
    "title": "Learn: [Core] BigQuery cost and query tuning",
    "description": "BigQuery docs: query plan, cost optimization best practices",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-02",
    "title": "Hands-on: [Core] BigQuery cost and query tuning",
    "description": "Dry-run queries; read execution graph; query INFORMATION_SCHEMA jobs; Job-market task (20 min): save 5 GCP Data Engineer JDs and list repeated requirements\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-02",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Flatten nested JSON (recursion) | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'BigQuery cost and query tuning'. | Optional: Drill: 'why is this query expensive?' (5 cases)",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-03",
    "title": "Learn: [Core] MERGE, upserts, SCD",
    "description": "BigQuery docs: MERGE; SCD Type 1/2 pattern",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-03",
    "title": "Hands-on: [Core] MERGE, upserts, SCD",
    "description": "Write MERGE from staging into container_tracking; try SCD2 on a dimension\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-03",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Custom exceptions + retry decorator | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'MERGE, upserts, SCD'. | Optional: Flashcards: MERGE vs INSERT/UPDATE",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-04",
    "title": "Learn: [Core] Views, UDFs, scripting",
    "description": "BigQuery docs: views, materialized views, routines, scripting",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-04",
    "title": "Hands-on: [Core] Views, UDFs, scripting",
    "description": "Build views + a stored procedure; scheduled query\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-04",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Generators: stream a large file line by line | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Views, UDFs, scripting'. | Optional: Notes: BigQuery scripting vs PL/SQL packages",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-05",
    "title": "Learn: [Core] Loading and streaming data",
    "description": "BigQuery docs: batch load, Storage Write API, time travel",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-05",
    "title": "Hands-on: [Core] Loading and streaming data",
    "description": "Compare batch load vs streaming insert; table snapshots\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-05",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): dict/defaultdict/Counter group-by | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Loading and streaming data'. | Optional: Notes: load options and when to use each",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-06",
    "title": "Learn: [Core] BigQuery interview drill",
    "description": "Interview-question video: BigQuery and Composer (The Data Engineering Experience)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-06",
    "title": "Hands-on: [Core] BigQuery interview drill",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 BigQuery questions out loud, timed\n\nOutput: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-06",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Reusable load_to_bigquery(file, table) function | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'BigQuery interview drill'. | Optional: Log weak topics",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-07",
    "title": "Learn: [Core] Week 1 project slice + checkpoint",
    "description": "Revise Week 1 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-07",
    "title": "Hands-on: [Core] Week 1 project slice + checkpoint",
    "description": "Project slice 1: EDI files in GCS, staging table, validation rules, MERGE into container_tracking + reject table\n\nOutput: Milestone 1 evidence: raw sample EDI in GCS/local; parser output; staging schema; validation + reject handling; repeat run produces no duplicate records.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-07",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Mini test: 5 data-wrangling problems (40 min) | SQL (30 min): 2 problems on gaps and islands | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 1 project slice + checkpoint' (30 min). | Optional: One-page BigQuery cheat sheet + 20-question quiz",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-08",
    "title": "Learn: [Core] Pub/Sub",
    "description": "Skills Boost (Data Engineer path): Pub/Sub / streaming module",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-08",
    "title": "Hands-on: [Core] Pub/Sub",
    "description": "Python publisher/subscriber; dead-letter topic; BigQuery subscription\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-08",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Messages as JSON + dataclasses | SQL (30 min): 2 problems on partition pruning + query cost | Interview (30 min): answer 5 questions aloud on 'Pub/Sub'. | Optional: Notes: Oracle AQ vs Pub/Sub",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-09",
    "title": "Learn: [Core] Streaming concepts",
    "description": "Beam docs: windowing, watermarks, triggers",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-09",
    "title": "Hands-on: [Core] Streaming concepts",
    "description": "Draw event time vs processing time with late-data example\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-09",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Dedup an event stream with set/dict | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Streaming concepts'. | Optional: Flashcards: window types",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-10",
    "title": "Learn: [Core] Apache Beam basics",
    "description": "Beam Python SDK programming guide",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-10",
    "title": "Hands-on: [Core] Apache Beam basics",
    "description": "Write a Beam pipeline: ParDo, GroupByKey, run on DirectRunner\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-10",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Bucket events into time windows by hand | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Apache Beam basics'. | Optional: 5 Beam questions",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-11",
    "title": "Learn: [Core] Dataflow batch",
    "description": "Skills Boost (Data Engineer path): Dataflow module",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-11",
    "title": "Hands-on: [Core] Dataflow batch",
    "description": "Run batch Beam pipeline GCS to BigQuery on Dataflow; try a template\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-11",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Retry with exponential backoff | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Dataflow batch'. | Optional: Notes: Dataflow autoscaling, templates",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-12",
    "title": "Learn: [Core] Dataflow streaming",
    "description": "Dataflow docs: streaming pipelines",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-12",
    "title": "Hands-on: [Core] Dataflow streaming",
    "description": "Pub/Sub to Dataflow to BigQuery with windowing and dead-letter output\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-12",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Beam-style pure functions (DoFn thinking) | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Dataflow streaming'. | Optional: Notes: failure handling",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-13",
    "title": "Learn: [Core] Exactly-once, idempotency, dedup",
    "description": "Dataflow/Pub/Sub docs: delivery semantics",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-13",
    "title": "Hands-on: [Core] Exactly-once, idempotency, dedup",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Add dedup by message/event id; replay test\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-13",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Idempotent processing function | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Exactly-once, idempotency, dedup'. | Optional: Drill: 25 streaming questions",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-14",
    "title": "Learn: [Core] Week 2 project slice + checkpoint",
    "description": "Revise Week 2 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-14",
    "title": "Hands-on: [Core] Week 2 project slice + checkpoint",
    "description": "Project slice 2: depot events via Pub/Sub, Dataflow streaming into BigQuery, DLQ for invalid events | Last 45 min: first draft of your resume (GCP skills + project bullets).\n\nOutput: Milestone 2 evidence: Pub/Sub publisher/subscriber; message schema; retry + dead-letter handling; duplicate event test.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-14",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Mini test: 5 event-processing problems | SQL (30 min): 2 problems on SCD Type 1/2 | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 2 project slice + checkpoint' (30 min). | Optional: Self-quiz: Pub/Sub + Dataflow",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-15",
    "title": "Learn: [Core] Airflow concepts (run locally first)",
    "description": "Apache Airflow docs: core concepts, tutorial",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-15",
    "title": "Hands-on: [Core] Airflow concepts (run locally first)",
    "description": "Run Airflow locally in Docker (avoids Composer cost); first DAG\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-15",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Callable for PythonOperator | SQL (30 min): 2 problems on gaps and islands | Interview (30 min): answer 5 questions aloud on 'Airflow concepts (run locally first)'. | Optional: Notes: DAG, task, operator, sensor, XCom",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-16",
    "title": "Learn: [Core] Airflow GCP operators",
    "description": "Airflow Google provider docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-16",
    "title": "Hands-on: [Core] Airflow GCP operators",
    "description": "DAG: sensor on GCS file, then BigQuery job operator\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-16",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Read/write GCS with the client library | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Airflow GCP operators'. | Optional: 5 Airflow questions",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-17",
    "title": "Learn: [Core] DAG design: retries, backfill, SLA",
    "description": "Airflow docs: scheduling, catchup, retries",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-17",
    "title": "Hands-on: [Core] DAG design: retries, backfill, SLA",
    "description": "Add retries, alerts, backfill test; task groups\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-17",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Logging + error handling in tasks | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'DAG design: retries, backfill, SLA'. | Optional: Notes: idempotent DAGs",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-18",
    "title": "Learn: [Working] Cloud Functions, Cloud Run, Eventarc",
    "description": "Cloud Run functions + Eventarc docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-18",
    "title": "Hands-on: [Working] Cloud Functions, Cloud Run, Eventarc",
    "description": "GCS-arrival trigger that starts validation\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-18",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Config-driven code (JSON/YAML config) | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Cloud Functions, Cloud Run, Eventarc'. | Optional: Notes: when to use Functions vs Run vs Dataflow",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-19",
    "title": "Learn: [Core] Cloud Composer",
    "description": "Skills Boost (Data Engineer path): Composer module",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-19",
    "title": "Hands-on: [Core] Cloud Composer",
    "description": "Deploy a small Composer env, upload DAG, then DELETE the env (cost)\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-19",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): datetime, timezones, partition dates | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Cloud Composer'. | Optional: Notes: Composer sizing and monitoring",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-20",
    "title": "Learn: [Core] Composer / Airflow interview drill",
    "description": "Interview-question video: BigQuery and Composer (The Data Engineering Experience)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-20",
    "title": "Hands-on: [Core] Composer / Airflow interview drill",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 Airflow questions out loud\n\nOutput: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-20",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Unit-test an ETL function with pytest | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Composer / Airflow interview drill'. | Optional: Log weak topics",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-21",
    "title": "Learn: [Core] Week 3 project slice + checkpoint",
    "description": "Revise Week 3 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-21",
    "title": "Hands-on: [Core] Week 3 project slice + checkpoint",
    "description": "Project slice 3: DAG orchestrating arrival, validation, MERGE; failure alert\n\nOutput: Milestone 3 evidence: Beam pipeline on DirectRunner/Dataflow as planned; event-time windowing; late data; BigQuery sink; failure/replay test.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-21",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Mini test: 5 ETL function problems | SQL (30 min): 2 problems on MERGE + incremental loads | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 3 project slice + checkpoint' (30 min). | Optional: Self-quiz: orchestration",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-22",
    "title": "Learn: [Working] PySpark core + Dataproc",
    "description": "Skills Boost (Data Engineer path): Dataproc module; Spark docs: DataFrames",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-22",
    "title": "Hands-on: [Working] PySpark core + Dataproc",
    "description": "Run a PySpark job on Dataproc (serverless if available)\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-22",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Same transformation in pandas vs PySpark | SQL (30 min): 2 problems on SCD Type 1/2 | Interview (30 min): answer 5 questions aloud on 'PySpark core + Dataproc'. | Optional: Notes: transformations vs actions",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-23",
    "title": "Learn: [Working] Spark performance, tool choice",
    "description": "Spark docs: tuning; Dataproc vs Dataflow vs BigQuery",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-23",
    "title": "Hands-on: [Working] Spark performance, tool choice",
    "description": "Broadcast join vs shuffle join experiment; skew example\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-23",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): lambda, map/filter, sorted with key | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Spark performance, tool choice'. | Optional: Table: when to use which tool",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-24",
    "title": "Learn: [Working] Dataform (or dbt)",
    "description": "Dataform docs: getting started, assertions",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-24",
    "title": "Hands-on: [Working] Dataform (or dbt)",
    "description": "Rebuild staging-to-clean transformation as Dataform models with assertions\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-24",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): itertools + collections | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Dataform (or dbt)'. | Optional: Notes: Dataform vs dbt vs Composer",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-25",
    "title": "Learn: [Working] Data modelling",
    "description": "Kimball star-schema primer; BigQuery schema design docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-25",
    "title": "Hands-on: [Working] Data modelling",
    "description": "Design facts/dims for container tracking; SCD2 for equipment\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-25",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Decorators + context managers | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Data modelling'. | Optional: Notes: normalize vs denormalize in BigQuery",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-26",
    "title": "Learn: [Working] File formats, BigLake, lakehouse",
    "description": "BigLake and Iceberg docs (overview)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-26",
    "title": "Hands-on: [Working] File formats, BigLake, lakehouse",
    "description": "Convert CSV to Parquet; query via external table\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-26",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): pandas groupby/merge for data checks | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'File formats, BigLake, lakehouse'. | Optional: Table: Avro vs Parquet vs ORC",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-27",
    "title": "Learn: [Working] Spark + modelling interview drill",
    "description": "Spark interview-question video of your choice",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-27",
    "title": "Hands-on: [Working] Spark + modelling interview drill",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 Spark/modelling questions out loud\n\nOutput: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-27",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Type hints + dataclasses | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Spark + modelling interview drill'. | Optional: Log weak topics",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-28",
    "title": "Learn: [Core] Week 4 project slice + checkpoint",
    "description": "Revise Week 4 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-28",
    "title": "Hands-on: [Core] Week 4 project slice + checkpoint",
    "description": "Project slice 4: Dataform layers (staging, clean, marts: latest status, dwell time) + assertions\n\nOutput: Milestone 4 evidence: Composer DAG (or local Airflow first); dependencies, retries, backfill, alerts; documented runbook.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-28",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Mini test: 5 mixed problems | SQL (30 min): 2 problems on dedup (latest record per key) | Mock interview 1 (45 min, record it): BigQuery, Pub/Sub, Dataflow, Composer, Python. | Optional: Self-quiz: Spark + modelling",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-29",
    "title": "Learn: [Working] PySpark DataFrame API in depth",
    "description": "Spark docs: DataFrame API, joins, window functions",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-29",
    "title": "Hands-on: [Working] PySpark DataFrame API in depth",
    "description": "On Dataproc: joins, aggregations, window functions on container-tracking events\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-29",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): PySpark: join + window problem | SQL (30 min): 2 problems on MERGE + incremental loads | Interview (30 min): answer 5 questions aloud on 'PySpark DataFrame API in depth'. | Optional: Notes: PySpark vs BigQuery SQL for the same task",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-11-30",
    "title": "Learn: [Working] Spark SQL + BigQuery connector",
    "description": "spark-bigquery-connector docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-11-30",
    "title": "Hands-on: [Working] Spark SQL + BigQuery connector",
    "description": "PySpark job reads GCS/BigQuery, transforms, writes back to BigQuery\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-11-30",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): PySpark: latest record per key | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Spark SQL + BigQuery connector'. | Optional: 5 PySpark questions",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-01",
    "title": "Learn: [Working] Spark internals: shuffle, skew, caching",
    "description": "Spark docs: tuning, explain plans",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-01",
    "title": "Hands-on: [Working] Spark internals: shuffle, skew, caching",
    "description": "Read explain plans; fix a skewed join; fix the small-files problem\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-01",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): PySpark: explode, arrays, structs | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Spark internals: shuffle, skew, caching'. | Optional: Notes: how to explain a slow Spark job",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-02",
    "title": "Learn: [Core] Structured Streaming concepts",
    "description": "Spark docs: Structured Streaming overview",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-02",
    "title": "Hands-on: [Core] Structured Streaming concepts",
    "description": "Notes + small demo: streaming vs micro-batch vs Dataflow (conceptual)\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-02",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): PySpark: UDF vs built-in functions | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Structured Streaming concepts'. | Optional: Table: Spark Streaming vs Dataflow vs Pub/Sub to BigQuery",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-03",
    "title": "Learn: [Core] Advanced SQL interview drill 1",
    "description": "SQL practice site of your choice",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-03",
    "title": "Hands-on: [Core] Advanced SQL interview drill 1",
    "description": "Gaps-and-islands, sessionization, top-N per group, dedup (8 problems)\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-03",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Regex/string parsing of EDI segments | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Advanced SQL interview drill 1'. | Optional: Review mistakes",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-04",
    "title": "Learn: [Core] Advanced SQL drill 2 + query tuning",
    "description": "BigQuery docs: query optimization (revisit)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-04",
    "title": "Hands-on: [Core] Advanced SQL drill 2 + query tuning",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: 8 more problems; rewrite 3 slow queries and measure bytes scanned\n\nOutput: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-04",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Parse an EDI-like message into JSON | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Advanced SQL drill 2 + query tuning'. | Optional: Log weak topics",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-05",
    "title": "Learn: [Core] Week 5 project slice + checkpoint",
    "description": "Revise Week 5 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-05",
    "title": "Hands-on: [Core] Week 5 project slice + checkpoint",
    "description": "Project slice 5: PySpark job to backfill historical container events into BigQuery\n\nOutput: Milestone 5 evidence: curated BigQuery model; MERGE/SCD2; partitioning/clustering; data quality checks; cost comparison.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-05",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Timed: 5 PySpark/Python problems | SQL (30 min): 2 problems on CTEs + subqueries | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 5 project slice + checkpoint' (30 min). | Optional: Timed 20-problem PySpark + SQL test",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-06",
    "title": "Learn: [Working] IAM, encryption, data security",
    "description": "Cloud IAM, CMEK, policy tags docs",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-06",
    "title": "Hands-on: [Working] IAM, encryption, data security",
    "description": "Least-privilege service accounts; column-level policy tag; row-level security\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-06",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Automate a task with the GCP client libraries | SQL (30 min): 2 problems on dedup (latest record per key) | Interview (30 min): answer 5 questions aloud on 'IAM, encryption, data security'. | Optional: Notes: security checklist for pipelines",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-07",
    "title": "Learn: [Awareness] Dataplex and governance",
    "description": "Skills Boost (Data Engineer path): governance/Dataplex content",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-07",
    "title": "Hands-on: [Awareness] Dataplex and governance",
    "description": "Explore catalog, lineage, data quality scans\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-07",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Config and secrets via env vars | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Dataplex and governance'. | Optional: Notes: governance terms",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-08",
    "title": "Learn: [Working] Monitoring and logging",
    "description": "Cloud Monitoring + Logging docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-08",
    "title": "Hands-on: [Working] Monitoring and logging",
    "description": "Alert on failed DAG and Dataflow lag; log-based metric\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-08",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Unit tests with mocks | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Monitoring and logging'. | Optional: Notes: what to monitor in a pipeline",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-09",
    "title": "Learn: [Awareness] Terraform basics",
    "description": "Terraform Google provider docs; HashiCorp tutorial",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-09",
    "title": "Hands-on: [Awareness] Terraform basics",
    "description": "Terraform buckets, dataset, Pub/Sub topics\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-09",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Virtualenv + requirements hygiene | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Terraform basics'. | Optional: Notes: state, plan, apply",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-10",
    "title": "Learn: [Awareness] CI/CD and Git",
    "description": "Cloud Build or GitHub Actions docs",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-10",
    "title": "Hands-on: [Awareness] CI/CD and Git",
    "description": "Pipeline: test + deploy DAGs and Dataform on merge\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-10",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): argparse CLI for a pipeline step | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'CI/CD and Git'. | Optional: Notes: branching, environments",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-11",
    "title": "Learn: [Working] Cost, reliability, DR",
    "description": "BigQuery editions/pricing docs; Cloud Storage lifecycle",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-11",
    "title": "Hands-on: [Working] Cost, reliability, DR",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Partition expiry, lifecycle rules, budgets; review project cost\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-11",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Refactor a messy ETL script | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Cost, reliability, DR'. | Optional: Drill: security/ops/cost questions",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-12",
    "title": "Learn: [Core] Week 6 project slice + checkpoint",
    "description": "Revise Week 6 notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-12",
    "title": "Hands-on: [Core] Week 6 project slice + checkpoint",
    "description": "Project slice 6: Terraform + CI/CD + monitoring + policy tags on the project\n\nOutput: Milestone 6 evidence: end-to-end demo; architecture diagram; README; setup/deploy steps; known limitations; 5-minute walkthrough.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-12",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Mini test: 5 problems | SQL (30 min): 2 problems on window functions | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 6 project slice + checkpoint' (30 min). | Optional: Self-quiz: security, ops, IaC",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-13",
    "title": "Learn: [Core] Capstone: end-to-end run",
    "description": "Re-read your own project notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-13",
    "title": "Hands-on: [Core] Capstone: end-to-end run",
    "description": "Generate ~1M sample rows; run EDI to GCS to staging to validation to tracking end to end\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-13",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Refactor project code into modules | SQL (30 min): 2 problems on CTEs + subqueries | Interview (30 min): answer 5 questions aloud on 'Capstone: end-to-end run'. | Optional: Fix list of gaps",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-14",
    "title": "Learn: [Core] Capstone: tune and measure",
    "description": "BigQuery cost docs (revisit)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-14",
    "title": "Hands-on: [Core] Capstone: tune and measure",
    "description": "Tune queries/partitions; record bytes scanned and runtime before/after\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-14",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Add logging + error handling | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Capstone: tune and measure'. | Optional: Write 3 'I improved X by Y' lines",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-15",
    "title": "Learn: [Core] Capstone: failure scenarios",
    "description": "Revisit exactly-once and backfill notes",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-15",
    "title": "Hands-on: [Core] Capstone: failure scenarios",
    "description": "Test replay, duplicates, late events, bad files; write runbook | Last 30 min: start selective applications (shortlist roles, tailor resume, apply to the first 3).\n\nOutput: Test results: duplicate file, duplicate event, late event, malformed record",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-15",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Unit tests for validation functions | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Capstone: failure scenarios'. | Optional: Notes: how you handle failures",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-16",
    "title": "Learn: [Core] Architecture diagram + README",
    "description": "Draw.io or similar",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-16",
    "title": "Hands-on: [Core] Architecture diagram + README",
    "description": "Architecture diagram, README, clean GitHub repo\n\nOutput: GitHub README + architecture diagram",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-16",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Type hints + README examples | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Architecture diagram + README'. | Optional: Review repo as a stranger would",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-17",
    "title": "Learn: [Core] Project story for interviews",
    "description": "Prepare answers",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-17",
    "title": "Hands-on: [Core] Project story for interviews",
    "description": "Write 2-minute and 10-minute walkthroughs; Oracle to GCP mapping (AQ to Pub/Sub, staging to BigQuery)\n\nOutput: Recorded 2-min and 10-min project story",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-17",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Explain your code aloud | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Project story for interviews'. | Optional: Practice aloud twice",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-18",
    "title": "Learn: [Core] Explain and present",
    "description": "Record yourself",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-18",
    "title": "Hands-on: [Core] Explain and present",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Record a walkthrough; optional Looker Studio dashboard (1 hr)\n\nOutput: Recorded walkthrough + notes on gaps",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-18",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Mock code walkthrough | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Explain and present'. | Optional: Note filler words and gaps",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-19",
    "title": "Learn: [Awareness] Alternatives + CDC",
    "description": "Datastream and Data Fusion docs (overview)",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-19",
    "title": "Hands-on: [Awareness] Alternatives + CDC",
    "description": "Notes: Datastream for Oracle CDC, Data Fusion, Dataproc alternatives; why you chose your stack\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-19",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Timed: 3 coding problems | SQL (30 min): 2 problems on joins + aggregations | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Alternatives + CDC' (30 min). | Optional: Table: tool choice trade-offs",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-20",
    "title": "Learn: [Core] System design: batch warehouse + streaming",
    "description": "Review your architecture notes",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-20",
    "title": "Hands-on: [Core] System design: batch warehouse + streaming",
    "description": "Design aloud: batch DW and streaming analytics, 2 designs, timed\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-20",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Timed problem set 1 (45 min) | SQL (30 min): 2 problems on window functions | Interview (30 min): answer 5 questions aloud on 'System design: batch warehouse + streaming'. | Optional: Write the design framework you use",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-21",
    "title": "Learn: [Awareness] System design: Oracle CDC / migration",
    "description": "Datastream + migration docs (revisit)",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-21",
    "title": "Hands-on: [Awareness] System design: Oracle CDC / migration",
    "description": "Design aloud: on-prem Oracle DW migration to BigQuery\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-21",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Timed problem set 2 (45 min) | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'System design: Oracle CDC / migration'. | Optional: Note trade-offs and risks",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-22",
    "title": "Learn: [Core] SQL timed practice",
    "description": "SQL practice site of your choice",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-22",
    "title": "Hands-on: [Core] SQL timed practice",
    "description": "15 timed problems: windows, dedup, gaps-and-islands, running totals\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-22",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Fix every weak spot from sets 1-2 | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'SQL timed practice'. | Optional: Review mistakes",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-23",
    "title": "Learn: [Working] Python / PySpark / Beam coding drill",
    "description": "Revisit Python + Beam notes",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-23",
    "title": "Hands-on: [Working] Python / PySpark / Beam coding drill",
    "description": "Coding drill: file processing, PySpark transforms, Beam snippets\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-23",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Timed problem set 3 (45 min) | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Python / PySpark / Beam coding drill'. | Optional: Review mistakes",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-24",
    "title": "Learn: [Core] Behavioural + 'tell me about yourself'",
    "description": "Prepare answers",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-24",
    "title": "Hands-on: [Core] Behavioural + 'tell me about yourself'",
    "description": "Write 5 STAR stories from your Lara work; 4-year-profile intro\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-24",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Code-review a peer script aloud | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Behavioural + 'tell me about yourself''. | Optional: Practice aloud",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-25",
    "title": "Learn: [Core] Light day: weak-topic review",
    "description": "Your weak-topic log",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-25",
    "title": "Hands-on: [Core] Light day: weak-topic review",
    "description": "BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Redo the labs you found hardest\n\nOutput: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-25",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Light: re-solve missed problems | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Light day: weak-topic review'. | Optional: Flashcards",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-26",
    "title": "Learn: [Core] Timed practice exam",
    "description": "Google PDE sample questions + practice tests",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-26",
    "title": "Hands-on: [Core] Timed practice exam",
    "description": "Take a timed practice exam; review every wrong answer\n\nOutput: Exam score + weak-topic log",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-26",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Timed problem set 4 (45 min) | SQL (30 min): 2 problems on partition pruning + query cost | Interview (30 min): answer 5 questions aloud on 'Timed practice exam'. | Optional: Update weak-topic log",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-27",
    "title": "Learn: [Core] Mock interview 2 (technical)",
    "description": "Mock with a friend or record yourself",
    "durationMinutes": 150,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-27",
    "title": "Hands-on: [Core] Mock interview 2 (technical)",
    "description": "Full technical mock; fix gaps same day\n\nOutput: Mock feedback log",
    "durationMinutes": 240,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-27",
    "title": "Python + SQL + interview drills",
    "description": "Python (30 min): Timed problem set 5 | SQL (30 min): 2 problems on joins + aggregations | Interview (30 min): answer 5 questions aloud on 'Mock interview 2 (technical)'. | Optional: Notes: feedback",
    "durationMinutes": 90,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-28",
    "title": "Learn: [Core] Resume + LinkedIn",
    "description": "Job postings keyword list",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-28",
    "title": "Hands-on: [Core] Resume + LinkedIn",
    "description": "Update resume with GCP skills and project bullets; LinkedIn headline\n\nOutput: Updated resume + LinkedIn",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-28",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Fix weak spots | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Resume + LinkedIn'. | Optional: Peer review if possible",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-29",
    "title": "Learn: [Core] Mock interview 3 (design + project)",
    "description": "Mock with a friend or record yourself",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-29",
    "title": "Hands-on: [Core] Mock interview 3 (design + project)",
    "description": "System design + project deep-dive mock\n\nOutput: Mock feedback log",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-29",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Timed problem set 6 | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Mock interview 3 (design + project)'. | Optional: Notes: feedback",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-30",
    "title": "Learn: [Core] Final revision sheet",
    "description": "All your notes",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-30",
    "title": "Hands-on: [Core] Final revision sheet",
    "description": "One-page service comparison + top-50 question sheet\n\nOutput: One-page service comparison + top-50 question sheet",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-30",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Re-solve missed problems | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Final revision sheet'. | Optional: Read it twice",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  },
  {
    "date": "2026-12-31",
    "title": "Learn: [Core] Wrap-up + application plan",
    "description": "Light review",
    "durationMinutes": 75,
    "category": "study",
    "completed": false
  },
  {
    "date": "2026-12-31",
    "title": "Hands-on: [Core] Wrap-up + application plan",
    "description": "Review applications sent; plan the next batch and follow-ups\n\nOutput: Application tracker with next batch planned",
    "durationMinutes": 120,
    "category": "practice",
    "completed": false
  },
  {
    "date": "2026-12-31",
    "title": "Python + SQL + interview drills",
    "description": "Python (15 min): Final Python cheat sheet | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Wrap-up + application plan'. | Optional: Rest early",
    "durationMinutes": 45,
    "category": "review",
    "completed": false
  }
] as Omit<StudyTask, 'id'>[];

// Keyed by `${date}|${category}`
export const PLAN_RESOURCES: Record<string, PlanResource[]> = {
  "2026-11-01|study": [
    {
      "label": "YouTube: BigQuery partitioning clustering tutorial",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20partitioning%20clustering%20tutorial"
    },
    {
      "label": "Docs: BigQuery partitioned tables",
      "url": "https://cloud.google.com/bigquery/docs/partitioned-tables"
    },
    {
      "label": "Video: Data Engineering Zoomcamp: BigQuery partitioning and clustering",
      "url": "https://youtu.be/-CqXf7vhhDs"
    }
  ],
  "2026-11-01|practice": [
    {
      "label": "Docs: BigQuery partitioned tables",
      "url": "https://cloud.google.com/bigquery/docs/partitioned-tables"
    }
  ],
  "2026-11-02|study": [
    {
      "label": "YouTube: BigQuery cost optimization query execution plan",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20cost%20optimization%20query%20execution%20plan"
    },
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    },
    {
      "label": "Video: Data Engineering Zoomcamp: BigQuery best practices",
      "url": "https://youtu.be/k81mLJVX08w"
    }
  ],
  "2026-11-02|practice": [
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-11-03|study": [
    {
      "label": "YouTube: BigQuery MERGE statement upsert SCD type 2",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20MERGE%20statement%20upsert%20SCD%20type%202"
    },
    {
      "label": "Docs: BigQuery DML statements (MERGE)",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-statements"
    }
  ],
  "2026-11-03|practice": [
    {
      "label": "Docs: BigQuery DML statements (MERGE)",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-statements"
    }
  ],
  "2026-11-04|study": [
    {
      "label": "YouTube: BigQuery views materialized views stored procedures",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20views%20materialized%20views%20stored%20procedures"
    },
    {
      "label": "Docs: BigQuery views",
      "url": "https://cloud.google.com/bigquery/docs/views-intro"
    }
  ],
  "2026-11-04|practice": [
    {
      "label": "Docs: BigQuery views",
      "url": "https://cloud.google.com/bigquery/docs/views-intro"
    }
  ],
  "2026-11-05|study": [
    {
      "label": "YouTube: BigQuery batch load vs Storage Write API",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20batch%20load%20vs%20Storage%20Write%20API"
    },
    {
      "label": "Docs: BigQuery loading data",
      "url": "https://cloud.google.com/bigquery/docs/loading-data"
    }
  ],
  "2026-11-05|practice": [
    {
      "label": "Docs: BigQuery loading data",
      "url": "https://cloud.google.com/bigquery/docs/loading-data"
    }
  ],
  "2026-11-06|study": [
    {
      "label": "YouTube: BigQuery SQL interview questions window functions",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20SQL%20interview%20questions%20window%20functions"
    },
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    },
    {
      "label": "Video: The Data Engineering Experience: BigQuery + Composer interview prep (summary page)",
      "url": "https://recapio.com/digest/gcp-data-engineer-interview-prep-bigquery-and-cloud-composer-by-the-data-engineering-experience"
    }
  ],
  "2026-11-06|practice": [
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    }
  ],
  "2026-11-07|study": [
    {
      "label": "YouTube: EDIFACT message parsing Python tutorial",
      "url": "https://www.youtube.com/results?search_query=EDIFACT%20message%20parsing%20Python%20tutorial"
    },
    {
      "label": "Docs: UN/EDIFACT reference",
      "url": "https://unece.org/trade/uncefact/unedifact"
    }
  ],
  "2026-11-07|practice": [
    {
      "label": "Docs: UN/EDIFACT reference",
      "url": "https://unece.org/trade/uncefact/unedifact"
    }
  ],
  "2026-11-08|study": [
    {
      "label": "YouTube: Google Cloud Pub/Sub tutorial dead letter topic",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Pub/Sub%20tutorial%20dead%20letter%20topic"
    },
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-11-08|practice": [
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-11-09|study": [
    {
      "label": "YouTube: Apache Beam windowing watermarks triggers explained",
      "url": "https://www.youtube.com/results?search_query=Apache%20Beam%20windowing%20watermarks%20triggers%20explained"
    },
    {
      "label": "Docs: Beam programming guide",
      "url": "https://beam.apache.org/documentation/programming-guide/"
    }
  ],
  "2026-11-09|practice": [
    {
      "label": "Docs: Beam programming guide",
      "url": "https://beam.apache.org/documentation/programming-guide/"
    }
  ],
  "2026-11-10|study": [
    {
      "label": "YouTube: Apache Beam Python tutorial",
      "url": "https://www.youtube.com/results?search_query=Apache%20Beam%20Python%20tutorial"
    },
    {
      "label": "Docs: Apache Beam docs",
      "url": "https://beam.apache.org/documentation/"
    }
  ],
  "2026-11-10|practice": [
    {
      "label": "Docs: Apache Beam docs",
      "url": "https://beam.apache.org/documentation/"
    }
  ],
  "2026-11-11|study": [
    {
      "label": "YouTube: Google Cloud Dataflow Python tutorial",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Dataflow%20Python%20tutorial"
    },
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-11|practice": [
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-12|study": [
    {
      "label": "YouTube: Dataflow streaming Pub/Sub to BigQuery tutorial",
      "url": "https://www.youtube.com/results?search_query=Dataflow%20streaming%20Pub/Sub%20to%20BigQuery%20tutorial"
    },
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-12|practice": [
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-13|study": [
    {
      "label": "YouTube: Pub/Sub at-least-once delivery deduplication Dataflow",
      "url": "https://www.youtube.com/results?search_query=Pub/Sub%20at-least-once%20delivery%20deduplication%20Dataflow"
    },
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-11-13|practice": [
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-11-14|study": [
    {
      "label": "YouTube: Dataflow streaming Pub/Sub to BigQuery tutorial",
      "url": "https://www.youtube.com/results?search_query=Dataflow%20streaming%20Pub/Sub%20to%20BigQuery%20tutorial"
    },
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-14|practice": [
    {
      "label": "Docs: Dataflow docs",
      "url": "https://cloud.google.com/dataflow/docs"
    }
  ],
  "2026-11-15|study": [
    {
      "label": "YouTube: Apache Airflow tutorial DAG for beginners",
      "url": "https://www.youtube.com/results?search_query=Apache%20Airflow%20tutorial%20DAG%20for%20beginners"
    },
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    }
  ],
  "2026-11-15|practice": [
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    }
  ],
  "2026-11-16|study": [
    {
      "label": "YouTube: Airflow BigQuery operator GCS sensor example",
      "url": "https://www.youtube.com/results?search_query=Airflow%20BigQuery%20operator%20GCS%20sensor%20example"
    },
    {
      "label": "Docs: Airflow Google provider docs",
      "url": "https://airflow.apache.org/docs/apache-airflow-providers-google/stable/index.html"
    }
  ],
  "2026-11-16|practice": [
    {
      "label": "Docs: Airflow Google provider docs",
      "url": "https://airflow.apache.org/docs/apache-airflow-providers-google/stable/index.html"
    }
  ],
  "2026-11-17|study": [
    {
      "label": "YouTube: Apache Airflow tutorial DAG for beginners",
      "url": "https://www.youtube.com/results?search_query=Apache%20Airflow%20tutorial%20DAG%20for%20beginners"
    },
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    }
  ],
  "2026-11-17|practice": [
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    }
  ],
  "2026-11-18|study": [
    {
      "label": "YouTube: Cloud Run functions Eventarc GCS trigger tutorial",
      "url": "https://www.youtube.com/results?search_query=Cloud%20Run%20functions%20Eventarc%20GCS%20trigger%20tutorial"
    },
    {
      "label": "Docs: Cloud Run docs",
      "url": "https://cloud.google.com/run/docs"
    }
  ],
  "2026-11-18|practice": [
    {
      "label": "Docs: Cloud Run docs",
      "url": "https://cloud.google.com/run/docs"
    }
  ],
  "2026-11-19|study": [
    {
      "label": "YouTube: Cloud Composer tutorial",
      "url": "https://www.youtube.com/results?search_query=Cloud%20Composer%20tutorial"
    },
    {
      "label": "Docs: Cloud Composer docs",
      "url": "https://cloud.google.com/composer/docs"
    }
  ],
  "2026-11-19|practice": [
    {
      "label": "Docs: Cloud Composer docs",
      "url": "https://cloud.google.com/composer/docs"
    }
  ],
  "2026-11-20|study": [
    {
      "label": "YouTube: Airflow interview questions data engineer",
      "url": "https://www.youtube.com/results?search_query=Airflow%20interview%20questions%20data%20engineer"
    },
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    },
    {
      "label": "Video: The Data Engineering Experience: BigQuery + Composer interview prep (summary page)",
      "url": "https://recapio.com/digest/gcp-data-engineer-interview-prep-bigquery-and-cloud-composer-by-the-data-engineering-experience"
    }
  ],
  "2026-11-20|practice": [
    {
      "label": "Docs: Apache Airflow docs",
      "url": "https://airflow.apache.org/docs/"
    }
  ],
  "2026-11-21|study": [
    {
      "label": "YouTube: Cloud Composer tutorial",
      "url": "https://www.youtube.com/results?search_query=Cloud%20Composer%20tutorial"
    },
    {
      "label": "Docs: Cloud Composer docs",
      "url": "https://cloud.google.com/composer/docs"
    }
  ],
  "2026-11-21|practice": [
    {
      "label": "Docs: Cloud Composer docs",
      "url": "https://cloud.google.com/composer/docs"
    }
  ],
  "2026-11-22|study": [
    {
      "label": "YouTube: PySpark tutorial data engineers DataFrame",
      "url": "https://www.youtube.com/results?search_query=PySpark%20tutorial%20data%20engineers%20DataFrame"
    },
    {
      "label": "Docs: Spark SQL and DataFrames guide",
      "url": "https://spark.apache.org/docs/latest/sql-programming-guide.html"
    }
  ],
  "2026-11-22|practice": [
    {
      "label": "Docs: Spark SQL and DataFrames guide",
      "url": "https://spark.apache.org/docs/latest/sql-programming-guide.html"
    }
  ],
  "2026-11-23|study": [
    {
      "label": "YouTube: Spark performance tuning shuffle skew broadcast join",
      "url": "https://www.youtube.com/results?search_query=Spark%20performance%20tuning%20shuffle%20skew%20broadcast%20join"
    },
    {
      "label": "Docs: Spark tuning guide",
      "url": "https://spark.apache.org/docs/latest/tuning.html"
    }
  ],
  "2026-11-23|practice": [
    {
      "label": "Docs: Spark tuning guide",
      "url": "https://spark.apache.org/docs/latest/tuning.html"
    }
  ],
  "2026-11-24|study": [
    {
      "label": "YouTube: Google Cloud Dataform tutorial BigQuery",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Dataform%20tutorial%20BigQuery"
    },
    {
      "label": "Docs: Dataform docs",
      "url": "https://cloud.google.com/dataform/docs"
    }
  ],
  "2026-11-24|practice": [
    {
      "label": "Docs: Dataform docs",
      "url": "https://cloud.google.com/dataform/docs"
    }
  ],
  "2026-11-25|study": [
    {
      "label": "YouTube: Kimball dimensional modelling star schema tutorial",
      "url": "https://www.youtube.com/results?search_query=Kimball%20dimensional%20modelling%20star%20schema%20tutorial"
    },
    {
      "label": "Docs: BigQuery schema design",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-performance-overview"
    }
  ],
  "2026-11-25|practice": [
    {
      "label": "Docs: BigQuery schema design",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-performance-overview"
    }
  ],
  "2026-11-26|study": [
    {
      "label": "YouTube: Parquet Avro ORC file formats comparison",
      "url": "https://www.youtube.com/results?search_query=Parquet%20Avro%20ORC%20file%20formats%20comparison"
    },
    {
      "label": "Docs: BigLake intro",
      "url": "https://cloud.google.com/bigquery/docs/biglake-intro"
    }
  ],
  "2026-11-26|practice": [
    {
      "label": "Docs: BigLake intro",
      "url": "https://cloud.google.com/bigquery/docs/biglake-intro"
    }
  ],
  "2026-11-27|study": [
    {
      "label": "YouTube: PySpark interview questions data engineer",
      "url": "https://www.youtube.com/results?search_query=PySpark%20interview%20questions%20data%20engineer"
    },
    {
      "label": "Docs: Spark docs",
      "url": "https://spark.apache.org/docs/latest/"
    }
  ],
  "2026-11-27|practice": [
    {
      "label": "Docs: Spark docs",
      "url": "https://spark.apache.org/docs/latest/"
    }
  ],
  "2026-11-28|study": [
    {
      "label": "YouTube: Google Cloud Dataform tutorial BigQuery",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Dataform%20tutorial%20BigQuery"
    },
    {
      "label": "Docs: Dataform docs",
      "url": "https://cloud.google.com/dataform/docs"
    }
  ],
  "2026-11-28|practice": [
    {
      "label": "Docs: Dataform docs",
      "url": "https://cloud.google.com/dataform/docs"
    }
  ],
  "2026-11-29|study": [
    {
      "label": "YouTube: PySpark tutorial data engineers DataFrame",
      "url": "https://www.youtube.com/results?search_query=PySpark%20tutorial%20data%20engineers%20DataFrame"
    },
    {
      "label": "Docs: Spark SQL and DataFrames guide",
      "url": "https://spark.apache.org/docs/latest/sql-programming-guide.html"
    }
  ],
  "2026-11-29|practice": [
    {
      "label": "Docs: Spark SQL and DataFrames guide",
      "url": "https://spark.apache.org/docs/latest/sql-programming-guide.html"
    }
  ],
  "2026-11-30|study": [
    {
      "label": "YouTube: Spark BigQuery connector Dataproc tutorial",
      "url": "https://www.youtube.com/results?search_query=Spark%20BigQuery%20connector%20Dataproc%20tutorial"
    },
    {
      "label": "Docs: spark-bigquery-connector",
      "url": "https://github.com/GoogleCloudDataproc/spark-bigquery-connector"
    }
  ],
  "2026-11-30|practice": [
    {
      "label": "Docs: spark-bigquery-connector",
      "url": "https://github.com/GoogleCloudDataproc/spark-bigquery-connector"
    }
  ],
  "2026-12-01|study": [
    {
      "label": "YouTube: Spark performance tuning shuffle skew broadcast join",
      "url": "https://www.youtube.com/results?search_query=Spark%20performance%20tuning%20shuffle%20skew%20broadcast%20join"
    },
    {
      "label": "Docs: Spark tuning guide",
      "url": "https://spark.apache.org/docs/latest/tuning.html"
    }
  ],
  "2026-12-01|practice": [
    {
      "label": "Docs: Spark tuning guide",
      "url": "https://spark.apache.org/docs/latest/tuning.html"
    }
  ],
  "2026-12-02|study": [
    {
      "label": "YouTube: Spark Structured Streaming explained",
      "url": "https://www.youtube.com/results?search_query=Spark%20Structured%20Streaming%20explained"
    },
    {
      "label": "Docs: Structured Streaming guide",
      "url": "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html"
    }
  ],
  "2026-12-02|practice": [
    {
      "label": "Docs: Structured Streaming guide",
      "url": "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html"
    }
  ],
  "2026-12-03|study": [
    {
      "label": "YouTube: BigQuery SQL interview questions window functions",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20SQL%20interview%20questions%20window%20functions"
    },
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    }
  ],
  "2026-12-03|practice": [
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    }
  ],
  "2026-12-04|study": [
    {
      "label": "YouTube: BigQuery cost optimization query execution plan",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20cost%20optimization%20query%20execution%20plan"
    },
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-04|practice": [
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-05|study": [
    {
      "label": "YouTube: Spark BigQuery connector Dataproc tutorial",
      "url": "https://www.youtube.com/results?search_query=Spark%20BigQuery%20connector%20Dataproc%20tutorial"
    },
    {
      "label": "Docs: spark-bigquery-connector",
      "url": "https://github.com/GoogleCloudDataproc/spark-bigquery-connector"
    }
  ],
  "2026-12-05|practice": [
    {
      "label": "Docs: spark-bigquery-connector",
      "url": "https://github.com/GoogleCloudDataproc/spark-bigquery-connector"
    }
  ],
  "2026-12-06|study": [
    {
      "label": "YouTube: Google Cloud IAM least privilege service accounts",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20IAM%20least%20privilege%20service%20accounts"
    },
    {
      "label": "Docs: Cloud IAM docs",
      "url": "https://cloud.google.com/iam/docs"
    }
  ],
  "2026-12-06|practice": [
    {
      "label": "Docs: Cloud IAM docs",
      "url": "https://cloud.google.com/iam/docs"
    }
  ],
  "2026-12-07|study": [
    {
      "label": "YouTube: Google Cloud Dataplex data governance lineage",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Dataplex%20data%20governance%20lineage"
    },
    {
      "label": "Docs: Dataplex docs",
      "url": "https://cloud.google.com/dataplex/docs"
    }
  ],
  "2026-12-07|practice": [
    {
      "label": "Docs: Dataplex docs",
      "url": "https://cloud.google.com/dataplex/docs"
    }
  ],
  "2026-12-08|study": [
    {
      "label": "YouTube: Google Cloud Monitoring alerting log-based metrics",
      "url": "https://www.youtube.com/results?search_query=Google%20Cloud%20Monitoring%20alerting%20log-based%20metrics"
    },
    {
      "label": "Docs: Cloud Monitoring docs",
      "url": "https://cloud.google.com/monitoring/docs"
    }
  ],
  "2026-12-08|practice": [
    {
      "label": "Docs: Cloud Monitoring docs",
      "url": "https://cloud.google.com/monitoring/docs"
    }
  ],
  "2026-12-09|study": [
    {
      "label": "YouTube: Terraform on Google Cloud tutorial",
      "url": "https://www.youtube.com/results?search_query=Terraform%20on%20Google%20Cloud%20tutorial"
    },
    {
      "label": "Docs: Terraform Google provider",
      "url": "https://registry.terraform.io/providers/hashicorp/google/latest/docs"
    }
  ],
  "2026-12-09|practice": [
    {
      "label": "Docs: Terraform Google provider",
      "url": "https://registry.terraform.io/providers/hashicorp/google/latest/docs"
    }
  ],
  "2026-12-10|study": [
    {
      "label": "YouTube: Cloud Build CI/CD pipeline tutorial",
      "url": "https://www.youtube.com/results?search_query=Cloud%20Build%20CI/CD%20pipeline%20tutorial"
    },
    {
      "label": "Docs: Cloud Build docs",
      "url": "https://cloud.google.com/build/docs"
    }
  ],
  "2026-12-10|practice": [
    {
      "label": "Docs: Cloud Build docs",
      "url": "https://cloud.google.com/build/docs"
    }
  ],
  "2026-12-11|study": [
    {
      "label": "YouTube: BigQuery cost optimization query execution plan",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20cost%20optimization%20query%20execution%20plan"
    },
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-11|practice": [
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-12|study": [
    {
      "label": "YouTube: Terraform on Google Cloud tutorial",
      "url": "https://www.youtube.com/results?search_query=Terraform%20on%20Google%20Cloud%20tutorial"
    },
    {
      "label": "Docs: Terraform Google provider",
      "url": "https://registry.terraform.io/providers/hashicorp/google/latest/docs"
    }
  ],
  "2026-12-12|practice": [
    {
      "label": "Docs: Terraform Google provider",
      "url": "https://registry.terraform.io/providers/hashicorp/google/latest/docs"
    }
  ],
  "2026-12-13|study": [
    {
      "label": "YouTube: end to end data pipeline project GCP walkthrough",
      "url": "https://www.youtube.com/results?search_query=end%20to%20end%20data%20pipeline%20project%20GCP%20walkthrough"
    }
  ],
  "2026-12-13|practice": [],
  "2026-12-14|study": [
    {
      "label": "YouTube: BigQuery cost optimization query execution plan",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20cost%20optimization%20query%20execution%20plan"
    },
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-14|practice": [
    {
      "label": "Docs: BigQuery cost best practices",
      "url": "https://cloud.google.com/bigquery/docs/best-practices-costs"
    }
  ],
  "2026-12-15|study": [
    {
      "label": "YouTube: Pub/Sub at-least-once delivery deduplication Dataflow",
      "url": "https://www.youtube.com/results?search_query=Pub/Sub%20at-least-once%20delivery%20deduplication%20Dataflow"
    },
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-12-15|practice": [
    {
      "label": "Docs: Pub/Sub docs",
      "url": "https://cloud.google.com/pubsub/docs"
    }
  ],
  "2026-12-16|study": [
    {
      "label": "YouTube: data engineering project README architecture diagram portfolio",
      "url": "https://www.youtube.com/results?search_query=data%20engineering%20project%20README%20architecture%20diagram%20portfolio"
    }
  ],
  "2026-12-16|practice": [],
  "2026-12-17|study": [
    {
      "label": "YouTube: how to explain your data engineering project in an interview",
      "url": "https://www.youtube.com/results?search_query=how%20to%20explain%20your%20data%20engineering%20project%20in%20an%20interview"
    }
  ],
  "2026-12-17|practice": [],
  "2026-12-18|study": [
    {
      "label": "YouTube: how to explain your data engineering project in an interview",
      "url": "https://www.youtube.com/results?search_query=how%20to%20explain%20your%20data%20engineering%20project%20in%20an%20interview"
    }
  ],
  "2026-12-18|practice": [],
  "2026-12-19|study": [
    {
      "label": "YouTube: Datastream Oracle to BigQuery CDC tutorial",
      "url": "https://www.youtube.com/results?search_query=Datastream%20Oracle%20to%20BigQuery%20CDC%20tutorial"
    },
    {
      "label": "Docs: Datastream docs",
      "url": "https://cloud.google.com/datastream/docs"
    }
  ],
  "2026-12-19|practice": [
    {
      "label": "Docs: Datastream docs",
      "url": "https://cloud.google.com/datastream/docs"
    }
  ],
  "2026-12-20|study": [
    {
      "label": "YouTube: data engineering system design interview GCP",
      "url": "https://www.youtube.com/results?search_query=data%20engineering%20system%20design%20interview%20GCP"
    },
    {
      "label": "Docs: Google Cloud architecture center",
      "url": "https://cloud.google.com/architecture"
    }
  ],
  "2026-12-20|practice": [
    {
      "label": "Docs: Google Cloud architecture center",
      "url": "https://cloud.google.com/architecture"
    }
  ],
  "2026-12-21|study": [
    {
      "label": "YouTube: Datastream Oracle to BigQuery CDC tutorial",
      "url": "https://www.youtube.com/results?search_query=Datastream%20Oracle%20to%20BigQuery%20CDC%20tutorial"
    },
    {
      "label": "Docs: Datastream docs",
      "url": "https://cloud.google.com/datastream/docs"
    }
  ],
  "2026-12-21|practice": [
    {
      "label": "Docs: Datastream docs",
      "url": "https://cloud.google.com/datastream/docs"
    }
  ],
  "2026-12-22|study": [
    {
      "label": "YouTube: BigQuery SQL interview questions window functions",
      "url": "https://www.youtube.com/results?search_query=BigQuery%20SQL%20interview%20questions%20window%20functions"
    },
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    }
  ],
  "2026-12-22|practice": [
    {
      "label": "Docs: BigQuery query syntax",
      "url": "https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax"
    }
  ],
  "2026-12-23|study": [
    {
      "label": "YouTube: Python data engineering interview coding questions",
      "url": "https://www.youtube.com/results?search_query=Python%20data%20engineering%20interview%20coding%20questions"
    },
    {
      "label": "Docs: Python docs",
      "url": "https://docs.python.org/3/"
    }
  ],
  "2026-12-23|practice": [
    {
      "label": "Docs: Python docs",
      "url": "https://docs.python.org/3/"
    }
  ],
  "2026-12-24|study": [
    {
      "label": "YouTube: behavioral interview STAR method tell me about yourself",
      "url": "https://www.youtube.com/results?search_query=behavioral%20interview%20STAR%20method%20tell%20me%20about%20yourself"
    }
  ],
  "2026-12-24|practice": [],
  "2026-12-25|study": [
    {
      "label": "YouTube: GCP data engineer interview questions and answers",
      "url": "https://www.youtube.com/results?search_query=GCP%20data%20engineer%20interview%20questions%20and%20answers"
    },
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-25|practice": [
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-26|study": [
    {
      "label": "YouTube: Professional Data Engineer exam sample questions walkthrough",
      "url": "https://www.youtube.com/results?search_query=Professional%20Data%20Engineer%20exam%20sample%20questions%20walkthrough"
    },
    {
      "label": "Docs: PDE exam guide",
      "url": "https://cloud.google.com/learn/certification/data-engineer"
    }
  ],
  "2026-12-26|practice": [
    {
      "label": "Docs: PDE exam guide",
      "url": "https://cloud.google.com/learn/certification/data-engineer"
    }
  ],
  "2026-12-27|study": [
    {
      "label": "YouTube: GCP data engineer interview questions and answers",
      "url": "https://www.youtube.com/results?search_query=GCP%20data%20engineer%20interview%20questions%20and%20answers"
    },
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-27|practice": [
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-28|study": [
    {
      "label": "YouTube: data engineer resume tips GCP",
      "url": "https://www.youtube.com/results?search_query=data%20engineer%20resume%20tips%20GCP"
    }
  ],
  "2026-12-28|practice": [],
  "2026-12-29|study": [
    {
      "label": "YouTube: GCP data engineer interview questions and answers",
      "url": "https://www.youtube.com/results?search_query=GCP%20data%20engineer%20interview%20questions%20and%20answers"
    },
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-29|practice": [
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-30|study": [
    {
      "label": "YouTube: GCP data engineer interview questions and answers",
      "url": "https://www.youtube.com/results?search_query=GCP%20data%20engineer%20interview%20questions%20and%20answers"
    },
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-30|practice": [
    {
      "label": "Docs: Google Cloud docs",
      "url": "https://cloud.google.com/docs"
    }
  ],
  "2026-12-31|study": [
    {
      "label": "YouTube: data engineer resume tips GCP",
      "url": "https://www.youtube.com/results?search_query=data%20engineer%20resume%20tips%20GCP"
    }
  ],
  "2026-12-31|practice": []
};

export const DEFAULT_HABITS = [
  { name: 'Study GCP Concepts', targetCount: 2, unit: 'hours', description: 'Watch videos, read docs, take notes', frequency: 'daily' as const },
  { name: 'Hands-on Practice', targetCount: 1, unit: 'hours', description: 'Complete labs, write code, deploy resources', frequency: 'daily' as const },
  { name: 'Review & Flashcards', targetCount: 30, unit: 'minutes', description: 'Anki/Quizlet review of key concepts', frequency: 'daily' as const },
  { name: 'Mock Questions', targetCount: 10, unit: 'questions', description: 'Practice exam questions', frequency: 'daily' as const },
  { name: 'Drink water', targetCount: 8, unit: 'glasses', description: 'One glass every 2 hours', frequency: 'daily' as const },
];

export function getCurriculumTasks(): Omit<StudyTask, 'id'>[] {
  return GCP_CURRICULUM;
}
