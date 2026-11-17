# 60-Day GCP Data Engineer Study Plan (Nov 1 - Dec 31, 2026)

This document contains the complete daily curriculum for 60-day Google Cloud Data Engineer preparation.

## How to Use with ChatGPT
- **Check Status / Schedule:** Ask "What is my syllabus for Day 17?" or "What should I study on 2026-11-17?"
- **Catch-Up:** Ask "I fell behind and missed Day 1 to Day 5. Give me a 3-day catch-up schedule."
- **Deep Dives & Quizzes:** Ask "Quiz me on today's hands-on topic: Airflow DAG retries and backfills."

---

### Day 1 — 2026-11-01
- **[STUDY] Learn: [Core] BigQuery architecture, partitioning, clustering** (150m)
  BigQuery docs: storage, partitioned and clustered tables
- **[PRACTICE] Hands-on: [Core] BigQuery architecture, partitioning, clustering** (240m)
  Quick setup (1 hr): project, budget alert, sample EDI files in GCS. Then partition + cluster a table; compare bytes processed before/after Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Parse CSV to dicts, validate required fields | SQL (30 min): 2 problems on joins + aggregations | Interview (30 min): answer 5 questions aloud on 'BigQuery architecture, partitioning, clustering'. | Optional: Notes: on-demand vs editions/slots

### Day 2 — 2026-11-02
- **[STUDY] Learn: [Core] BigQuery cost and query tuning** (75m)
  BigQuery docs: query plan, cost optimization best practices
- **[PRACTICE] Hands-on: [Core] BigQuery cost and query tuning** (120m)
  Dry-run queries; read execution graph; query INFORMATION_SCHEMA jobs; Job-market task (20 min): save 5 GCP Data Engineer JDs and list repeated requirements Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Flatten nested JSON (recursion) | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'BigQuery cost and query tuning'. | Optional: Drill: 'why is this query expensive?' (5 cases)

### Day 3 — 2026-11-03
- **[STUDY] Learn: [Core] MERGE, upserts, SCD** (75m)
  BigQuery docs: MERGE; SCD Type 1/2 pattern
- **[PRACTICE] Hands-on: [Core] MERGE, upserts, SCD** (120m)
  Write MERGE from staging into container_tracking; try SCD2 on a dimension Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Custom exceptions + retry decorator | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'MERGE, upserts, SCD'. | Optional: Flashcards: MERGE vs INSERT/UPDATE

### Day 4 — 2026-11-04
- **[STUDY] Learn: [Core] Views, UDFs, scripting** (75m)
  BigQuery docs: views, materialized views, routines, scripting
- **[PRACTICE] Hands-on: [Core] Views, UDFs, scripting** (120m)
  Build views + a stored procedure; scheduled query Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Generators: stream a large file line by line | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Views, UDFs, scripting'. | Optional: Notes: BigQuery scripting vs PL/SQL packages

### Day 5 — 2026-11-05
- **[STUDY] Learn: [Core] Loading and streaming data** (75m)
  BigQuery docs: batch load, Storage Write API, time travel
- **[PRACTICE] Hands-on: [Core] Loading and streaming data** (120m)
  Compare batch load vs streaming insert; table snapshots Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): dict/defaultdict/Counter group-by | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Loading and streaming data'. | Optional: Notes: load options and when to use each

### Day 6 — 2026-11-06
- **[STUDY] Learn: [Core] BigQuery interview drill** (75m)
  Interview-question video: BigQuery and Composer (The Data Engineering Experience)
- **[PRACTICE] Hands-on: [Core] BigQuery interview drill** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 BigQuery questions out loud, timed Output: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Reusable load_to_bigquery(file, table) function | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'BigQuery interview drill'. | Optional: Log weak topics

### Day 7 — 2026-11-07
- **[STUDY] Learn: [Core] Week 1 project slice + checkpoint** (150m)
  Revise Week 1 notes
- **[PRACTICE] Hands-on: [Core] Week 1 project slice + checkpoint** (240m)
  Project slice 1: EDI files in GCS, staging table, validation rules, MERGE into container_tracking + reject table Output: Milestone 1 evidence: raw sample EDI in GCS/local; parser output; staging schema; validation + reject handling; repeat run produces no duplicate records.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Mini test: 5 data-wrangling problems (40 min) | SQL (30 min): 2 problems on gaps and islands | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 1 project slice + checkpoint' (30 min). | Optional: One-page BigQuery cheat sheet + 20-question quiz

### Day 8 — 2026-11-08
- **[STUDY] Learn: [Core] Pub/Sub** (150m)
  Skills Boost (Data Engineer path): Pub/Sub / streaming module
- **[PRACTICE] Hands-on: [Core] Pub/Sub** (240m)
  Python publisher/subscriber; dead-letter topic; BigQuery subscription Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Messages as JSON + dataclasses | SQL (30 min): 2 problems on partition pruning + query cost | Interview (30 min): answer 5 questions aloud on 'Pub/Sub'. | Optional: Notes: Oracle AQ vs Pub/Sub

### Day 9 — 2026-11-09
- **[STUDY] Learn: [Core] Streaming concepts** (75m)
  Beam docs: windowing, watermarks, triggers
- **[PRACTICE] Hands-on: [Core] Streaming concepts** (120m)
  Draw event time vs processing time with late-data example Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Dedup an event stream with set/dict | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Streaming concepts'. | Optional: Flashcards: window types

### Day 10 — 2026-11-10
- **[STUDY] Learn: [Core] Apache Beam basics** (75m)
  Beam Python SDK programming guide
- **[PRACTICE] Hands-on: [Core] Apache Beam basics** (120m)
  Write a Beam pipeline: ParDo, GroupByKey, run on DirectRunner Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Bucket events into time windows by hand | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Apache Beam basics'. | Optional: 5 Beam questions

### Day 11 — 2026-11-11
- **[STUDY] Learn: [Core] Dataflow batch** (75m)
  Skills Boost (Data Engineer path): Dataflow module
- **[PRACTICE] Hands-on: [Core] Dataflow batch** (120m)
  Run batch Beam pipeline GCS to BigQuery on Dataflow; try a template Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Retry with exponential backoff | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Dataflow batch'. | Optional: Notes: Dataflow autoscaling, templates

### Day 12 — 2026-11-12
- **[STUDY] Learn: [Core] Dataflow streaming** (75m)
  Dataflow docs: streaming pipelines
- **[PRACTICE] Hands-on: [Core] Dataflow streaming** (120m)
  Pub/Sub to Dataflow to BigQuery with windowing and dead-letter output Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Beam-style pure functions (DoFn thinking) | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Dataflow streaming'. | Optional: Notes: failure handling

### Day 13 — 2026-11-13
- **[STUDY] Learn: [Core] Exactly-once, idempotency, dedup** (75m)
  Dataflow/Pub/Sub docs: delivery semantics
- **[PRACTICE] Hands-on: [Core] Exactly-once, idempotency, dedup** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Add dedup by message/event id; replay test Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Idempotent processing function | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Exactly-once, idempotency, dedup'. | Optional: Drill: 25 streaming questions

### Day 14 — 2026-11-14
- **[STUDY] Learn: [Core] Week 2 project slice + checkpoint** (150m)
  Revise Week 2 notes
- **[PRACTICE] Hands-on: [Core] Week 2 project slice + checkpoint** (240m)
  Project slice 2: depot events via Pub/Sub, Dataflow streaming into BigQuery, DLQ for invalid events | Last 45 min: first draft of your resume (GCP skills + project bullets). Output: Milestone 2 evidence: Pub/Sub publisher/subscriber; message schema; retry + dead-letter handling; duplicate event test.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Mini test: 5 event-processing problems | SQL (30 min): 2 problems on SCD Type 1/2 | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 2 project slice + checkpoint' (30 min). | Optional: Self-quiz: Pub/Sub + Dataflow

### Day 15 — 2026-11-15
- **[STUDY] Learn: [Core] Airflow concepts (run locally first)** (150m)
  Apache Airflow docs: core concepts, tutorial
- **[PRACTICE] Hands-on: [Core] Airflow concepts (run locally first)** (240m)
  Run Airflow locally in Docker (avoids Composer cost); first DAG Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Callable for PythonOperator | SQL (30 min): 2 problems on gaps and islands | Interview (30 min): answer 5 questions aloud on 'Airflow concepts (run locally first)'. | Optional: Notes: DAG, task, operator, sensor, XCom

### Day 16 — 2026-11-16
- **[STUDY] Learn: [Core] Airflow GCP operators** (75m)
  Airflow Google provider docs
- **[PRACTICE] Hands-on: [Core] Airflow GCP operators** (120m)
  DAG: sensor on GCS file, then BigQuery job operator Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Read/write GCS with the client library | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Airflow GCP operators'. | Optional: 5 Airflow questions

### Day 17 — 2026-11-17
- **[STUDY] Learn: [Core] DAG design: retries, backfill, SLA** (75m)
  Airflow docs: scheduling, catchup, retries
- **[PRACTICE] Hands-on: [Core] DAG design: retries, backfill, SLA** (120m)
  Add retries, alerts, backfill test; task groups Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Logging + error handling in tasks | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'DAG design: retries, backfill, SLA'. | Optional: Notes: idempotent DAGs

### Day 18 — 2026-11-18
- **[STUDY] Learn: [Working] Cloud Functions, Cloud Run, Eventarc** (75m)
  Cloud Run functions + Eventarc docs
- **[PRACTICE] Hands-on: [Working] Cloud Functions, Cloud Run, Eventarc** (120m)
  GCS-arrival trigger that starts validation Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Config-driven code (JSON/YAML config) | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Cloud Functions, Cloud Run, Eventarc'. | Optional: Notes: when to use Functions vs Run vs Dataflow

### Day 19 — 2026-11-19
- **[STUDY] Learn: [Core] Cloud Composer** (75m)
  Skills Boost (Data Engineer path): Composer module
- **[PRACTICE] Hands-on: [Core] Cloud Composer** (120m)
  Deploy a small Composer env, upload DAG, then DELETE the env (cost) Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): datetime, timezones, partition dates | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Cloud Composer'. | Optional: Notes: Composer sizing and monitoring

### Day 20 — 2026-11-20
- **[STUDY] Learn: [Core] Composer / Airflow interview drill** (75m)
  Interview-question video: BigQuery and Composer (The Data Engineering Experience)
- **[PRACTICE] Hands-on: [Core] Composer / Airflow interview drill** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 Airflow questions out loud Output: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Unit-test an ETL function with pytest | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Composer / Airflow interview drill'. | Optional: Log weak topics

### Day 21 — 2026-11-21
- **[STUDY] Learn: [Core] Week 3 project slice + checkpoint** (150m)
  Revise Week 3 notes
- **[PRACTICE] Hands-on: [Core] Week 3 project slice + checkpoint** (240m)
  Project slice 3: DAG orchestrating arrival, validation, MERGE; failure alert Output: Milestone 3 evidence: Beam pipeline on DirectRunner/Dataflow as planned; event-time windowing; late data; BigQuery sink; failure/replay test.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Mini test: 5 ETL function problems | SQL (30 min): 2 problems on MERGE + incremental loads | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 3 project slice + checkpoint' (30 min). | Optional: Self-quiz: orchestration

### Day 22 — 2026-11-22
- **[STUDY] Learn: [Working] PySpark core + Dataproc** (150m)
  Skills Boost (Data Engineer path): Dataproc module; Spark docs: DataFrames
- **[PRACTICE] Hands-on: [Working] PySpark core + Dataproc** (240m)
  Run a PySpark job on Dataproc (serverless if available) Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Same transformation in pandas vs PySpark | SQL (30 min): 2 problems on SCD Type 1/2 | Interview (30 min): answer 5 questions aloud on 'PySpark core + Dataproc'. | Optional: Notes: transformations vs actions

### Day 23 — 2026-11-23
- **[STUDY] Learn: [Working] Spark performance, tool choice** (75m)
  Spark docs: tuning; Dataproc vs Dataflow vs BigQuery
- **[PRACTICE] Hands-on: [Working] Spark performance, tool choice** (120m)
  Broadcast join vs shuffle join experiment; skew example Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): lambda, map/filter, sorted with key | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Spark performance, tool choice'. | Optional: Table: when to use which tool

### Day 24 — 2026-11-24
- **[STUDY] Learn: [Working] Dataform (or dbt)** (75m)
  Dataform docs: getting started, assertions
- **[PRACTICE] Hands-on: [Working] Dataform (or dbt)** (120m)
  Rebuild staging-to-clean transformation as Dataform models with assertions Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): itertools + collections | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Dataform (or dbt)'. | Optional: Notes: Dataform vs dbt vs Composer

### Day 25 — 2026-11-25
- **[STUDY] Learn: [Working] Data modelling** (75m)
  Kimball star-schema primer; BigQuery schema design docs
- **[PRACTICE] Hands-on: [Working] Data modelling** (120m)
  Design facts/dims for container tracking; SCD2 for equipment Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Decorators + context managers | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Data modelling'. | Optional: Notes: normalize vs denormalize in BigQuery

### Day 26 — 2026-11-26
- **[STUDY] Learn: [Working] File formats, BigLake, lakehouse** (75m)
  BigLake and Iceberg docs (overview)
- **[PRACTICE] Hands-on: [Working] File formats, BigLake, lakehouse** (120m)
  Convert CSV to Parquet; query via external table Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): pandas groupby/merge for data checks | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'File formats, BigLake, lakehouse'. | Optional: Table: Avro vs Parquet vs ORC

### Day 27 — 2026-11-27
- **[STUDY] Learn: [Working] Spark + modelling interview drill** (75m)
  Spark interview-question video of your choice
- **[PRACTICE] Hands-on: [Working] Spark + modelling interview drill** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Answer 25 Spark/modelling questions out loud Output: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Type hints + dataclasses | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Spark + modelling interview drill'. | Optional: Log weak topics

### Day 28 — 2026-11-28
- **[STUDY] Learn: [Core] Week 4 project slice + checkpoint** (150m)
  Revise Week 4 notes
- **[PRACTICE] Hands-on: [Core] Week 4 project slice + checkpoint** (240m)
  Project slice 4: Dataform layers (staging, clean, marts: latest status, dwell time) + assertions Output: Milestone 4 evidence: Composer DAG (or local Airflow first); dependencies, retries, backfill, alerts; documented runbook.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (15 min): Mini test: 5 mixed problems | SQL (30 min): 2 problems on dedup (latest record per key) | Mock interview 1 (45 min, record it): BigQuery, Pub/Sub, Dataflow, Composer, Python. | Optional: Self-quiz: Spark + modelling

### Day 29 — 2026-11-29
- **[STUDY] Learn: [Working] PySpark DataFrame API in depth** (150m)
  Spark docs: DataFrame API, joins, window functions
- **[PRACTICE] Hands-on: [Working] PySpark DataFrame API in depth** (240m)
  On Dataproc: joins, aggregations, window functions on container-tracking events Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): PySpark: join + window problem | SQL (30 min): 2 problems on MERGE + incremental loads | Interview (30 min): answer 5 questions aloud on 'PySpark DataFrame API in depth'. | Optional: Notes: PySpark vs BigQuery SQL for the same task

### Day 30 — 2026-11-30
- **[STUDY] Learn: [Working] Spark SQL + BigQuery connector** (75m)
  spark-bigquery-connector docs
- **[PRACTICE] Hands-on: [Working] Spark SQL + BigQuery connector** (120m)
  PySpark job reads GCS/BigQuery, transforms, writes back to BigQuery Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): PySpark: latest record per key | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Spark SQL + BigQuery connector'. | Optional: 5 PySpark questions

### Day 31 — 2026-12-01
- **[STUDY] Learn: [Working] Spark internals: shuffle, skew, caching** (75m)
  Spark docs: tuning, explain plans
- **[PRACTICE] Hands-on: [Working] Spark internals: shuffle, skew, caching** (120m)
  Read explain plans; fix a skewed join; fix the small-files problem Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): PySpark: explode, arrays, structs | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Spark internals: shuffle, skew, caching'. | Optional: Notes: how to explain a slow Spark job

### Day 32 — 2026-12-02
- **[STUDY] Learn: [Core] Structured Streaming concepts** (75m)
  Spark docs: Structured Streaming overview
- **[PRACTICE] Hands-on: [Core] Structured Streaming concepts** (120m)
  Notes + small demo: streaming vs micro-batch vs Dataflow (conceptual) Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): PySpark: UDF vs built-in functions | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Structured Streaming concepts'. | Optional: Table: Spark Streaming vs Dataflow vs Pub/Sub to BigQuery

### Day 33 — 2026-12-03
- **[STUDY] Learn: [Core] Advanced SQL interview drill 1** (75m)
  SQL practice site of your choice
- **[PRACTICE] Hands-on: [Core] Advanced SQL interview drill 1** (120m)
  Gaps-and-islands, sessionization, top-N per group, dedup (8 problems) Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Regex/string parsing of EDI segments | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Advanced SQL interview drill 1'. | Optional: Review mistakes

### Day 34 — 2026-12-04
- **[STUDY] Learn: [Core] Advanced SQL drill 2 + query tuning** (75m)
  BigQuery docs: query optimization (revisit)
- **[PRACTICE] Hands-on: [Core] Advanced SQL drill 2 + query tuning** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: 8 more problems; rewrite 3 slow queries and measure bytes scanned Output: Timed verbal answers recorded; gaps written down; weak answers revisited within 48 hours.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Parse an EDI-like message into JSON | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Advanced SQL drill 2 + query tuning'. | Optional: Log weak topics

### Day 35 — 2026-12-05
- **[STUDY] Learn: [Core] Week 5 project slice + checkpoint** (150m)
  Revise Week 5 notes
- **[PRACTICE] Hands-on: [Core] Week 5 project slice + checkpoint** (240m)
  Project slice 5: PySpark job to backfill historical container events into BigQuery Output: Milestone 5 evidence: curated BigQuery model; MERGE/SCD2; partitioning/clustering; data quality checks; cost comparison.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Timed: 5 PySpark/Python problems | SQL (30 min): 2 problems on CTEs + subqueries | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 5 project slice + checkpoint' (30 min). | Optional: Timed 20-problem PySpark + SQL test

### Day 36 — 2026-12-06
- **[STUDY] Learn: [Working] IAM, encryption, data security** (150m)
  Cloud IAM, CMEK, policy tags docs
- **[PRACTICE] Hands-on: [Working] IAM, encryption, data security** (240m)
  Least-privilege service accounts; column-level policy tag; row-level security Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Automate a task with the GCP client libraries | SQL (30 min): 2 problems on dedup (latest record per key) | Interview (30 min): answer 5 questions aloud on 'IAM, encryption, data security'. | Optional: Notes: security checklist for pipelines

### Day 37 — 2026-12-07
- **[STUDY] Learn: [Awareness] Dataplex and governance** (75m)
  Skills Boost (Data Engineer path): governance/Dataplex content
- **[PRACTICE] Hands-on: [Awareness] Dataplex and governance** (120m)
  Explore catalog, lineage, data quality scans Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Config and secrets via env vars | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Dataplex and governance'. | Optional: Notes: governance terms

### Day 38 — 2026-12-08
- **[STUDY] Learn: [Working] Monitoring and logging** (75m)
  Cloud Monitoring + Logging docs
- **[PRACTICE] Hands-on: [Working] Monitoring and logging** (120m)
  Alert on failed DAG and Dataflow lag; log-based metric Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Unit tests with mocks | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Monitoring and logging'. | Optional: Notes: what to monitor in a pipeline

### Day 39 — 2026-12-09
- **[STUDY] Learn: [Awareness] Terraform basics** (75m)
  Terraform Google provider docs; HashiCorp tutorial
- **[PRACTICE] Hands-on: [Awareness] Terraform basics** (120m)
  Terraform buckets, dataset, Pub/Sub topics Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Virtualenv + requirements hygiene | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Terraform basics'. | Optional: Notes: state, plan, apply

### Day 40 — 2026-12-10
- **[STUDY] Learn: [Awareness] CI/CD and Git** (75m)
  Cloud Build or GitHub Actions docs
- **[PRACTICE] Hands-on: [Awareness] CI/CD and Git** (120m)
  Pipeline: test + deploy DAGs and Dataform on merge Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): argparse CLI for a pipeline step | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'CI/CD and Git'. | Optional: Notes: branching, environments

### Day 41 — 2026-12-11
- **[STUDY] Learn: [Working] Cost, reliability, DR** (75m)
  BigQuery editions/pricing docs; Cloud Storage lifecycle
- **[PRACTICE] Hands-on: [Working] Cost, reliability, DR** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Partition expiry, lifecycle rules, budgets; review project cost Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Refactor a messy ETL script | SQL (15 min): 2 problems on joins + aggregations | Interview (15 min): answer 5 questions aloud on 'Cost, reliability, DR'. | Optional: Drill: security/ops/cost questions

### Day 42 — 2026-12-12
- **[STUDY] Learn: [Core] Week 6 project slice + checkpoint** (150m)
  Revise Week 6 notes
- **[PRACTICE] Hands-on: [Core] Week 6 project slice + checkpoint** (240m)
  Project slice 6: Terraform + CI/CD + monitoring + policy tags on the project Output: Milestone 6 evidence: end-to-end demo; architecture diagram; README; setup/deploy steps; known limitations; 5-minute walkthrough.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Mini test: 5 problems | SQL (30 min): 2 problems on window functions | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Week 6 project slice + checkpoint' (30 min). | Optional: Self-quiz: security, ops, IaC

### Day 43 — 2026-12-13
- **[STUDY] Learn: [Core] Capstone: end-to-end run** (150m)
  Re-read your own project notes
- **[PRACTICE] Hands-on: [Core] Capstone: end-to-end run** (240m)
  Generate ~1M sample rows; run EDI to GCS to staging to validation to tracking end to end Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Refactor project code into modules | SQL (30 min): 2 problems on CTEs + subqueries | Interview (30 min): answer 5 questions aloud on 'Capstone: end-to-end run'. | Optional: Fix list of gaps

### Day 44 — 2026-12-14
- **[STUDY] Learn: [Core] Capstone: tune and measure** (75m)
  BigQuery cost docs (revisit)
- **[PRACTICE] Hands-on: [Core] Capstone: tune and measure** (120m)
  Tune queries/partitions; record bytes scanned and runtime before/after Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Add logging + error handling | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Capstone: tune and measure'. | Optional: Write 3 'I improved X by Y' lines

### Day 45 — 2026-12-15
- **[STUDY] Learn: [Core] Capstone: failure scenarios** (75m)
  Revisit exactly-once and backfill notes
- **[PRACTICE] Hands-on: [Core] Capstone: failure scenarios** (120m)
  Test replay, duplicates, late events, bad files; write runbook | Last 30 min: start selective applications (shortlist roles, tailor resume, apply to the first 3). Output: Test results: duplicate file, duplicate event, late event, malformed record
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Unit tests for validation functions | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Capstone: failure scenarios'. | Optional: Notes: how you handle failures

### Day 46 — 2026-12-16
- **[STUDY] Learn: [Core] Architecture diagram + README** (75m)
  Draw.io or similar
- **[PRACTICE] Hands-on: [Core] Architecture diagram + README** (120m)
  Architecture diagram, README, clean GitHub repo Output: GitHub README + architecture diagram
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Type hints + README examples | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Architecture diagram + README'. | Optional: Review repo as a stranger would

### Day 47 — 2026-12-17
- **[STUDY] Learn: [Core] Project story for interviews** (75m)
  Prepare answers
- **[PRACTICE] Hands-on: [Core] Project story for interviews** (120m)
  Write 2-minute and 10-minute walkthroughs; Oracle to GCP mapping (AQ to Pub/Sub, staging to BigQuery) Output: Recorded 2-min and 10-min project story
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Explain your code aloud | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Project story for interviews'. | Optional: Practice aloud twice

### Day 48 — 2026-12-18
- **[STUDY] Learn: [Core] Explain and present** (75m)
  Record yourself
- **[PRACTICE] Hands-on: [Core] Explain and present** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Record a walkthrough; optional Looker Studio dashboard (1 hr) Output: Recorded walkthrough + notes on gaps
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Mock code walkthrough | SQL (15 min): 2 problems on partition pruning + query cost | Interview (15 min): answer 5 questions aloud on 'Explain and present'. | Optional: Note filler words and gaps

### Day 49 — 2026-12-19
- **[STUDY] Learn: [Awareness] Alternatives + CDC** (150m)
  Datastream and Data Fusion docs (overview)
- **[PRACTICE] Hands-on: [Awareness] Alternatives + CDC** (240m)
  Notes: Datastream for Oracle CDC, Data Fusion, Dataproc alternatives; why you chose your stack Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Timed: 3 coding problems | SQL (30 min): 2 problems on joins + aggregations | Record a 5-min no-notes explanation of this week and watch it back; then 5 questions aloud on 'Alternatives + CDC' (30 min). | Optional: Table: tool choice trade-offs

### Day 50 — 2026-12-20
- **[STUDY] Learn: [Core] System design: batch warehouse + streaming** (150m)
  Review your architecture notes
- **[PRACTICE] Hands-on: [Core] System design: batch warehouse + streaming** (240m)
  Design aloud: batch DW and streaming analytics, 2 designs, timed Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Timed problem set 1 (45 min) | SQL (30 min): 2 problems on window functions | Interview (30 min): answer 5 questions aloud on 'System design: batch warehouse + streaming'. | Optional: Write the design framework you use

### Day 51 — 2026-12-21
- **[STUDY] Learn: [Awareness] System design: Oracle CDC / migration** (75m)
  Datastream + migration docs (revisit)
- **[PRACTICE] Hands-on: [Awareness] System design: Oracle CDC / migration** (120m)
  Design aloud: on-prem Oracle DW migration to BigQuery Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Timed problem set 2 (45 min) | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'System design: Oracle CDC / migration'. | Optional: Note trade-offs and risks

### Day 52 — 2026-12-22
- **[STUDY] Learn: [Core] SQL timed practice** (75m)
  SQL practice site of your choice
- **[PRACTICE] Hands-on: [Core] SQL timed practice** (120m)
  15 timed problems: windows, dedup, gaps-and-islands, running totals Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Fix every weak spot from sets 1-2 | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'SQL timed practice'. | Optional: Review mistakes

### Day 53 — 2026-12-23
- **[STUDY] Learn: [Working] Python / PySpark / Beam coding drill** (75m)
  Revisit Python + Beam notes
- **[PRACTICE] Hands-on: [Working] Python / PySpark / Beam coding drill** (120m)
  Coding drill: file processing, PySpark transforms, Beam snippets Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Timed problem set 3 (45 min) | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Python / PySpark / Beam coding drill'. | Optional: Review mistakes

### Day 54 — 2026-12-24
- **[STUDY] Learn: [Core] Behavioural + 'tell me about yourself'** (75m)
  Prepare answers
- **[PRACTICE] Hands-on: [Core] Behavioural + 'tell me about yourself'** (120m)
  Write 5 STAR stories from your Lara work; 4-year-profile intro Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Code-review a peer script aloud | SQL (15 min): 2 problems on SCD Type 1/2 | Interview (15 min): answer 5 questions aloud on 'Behavioural + 'tell me about yourself''. | Optional: Practice aloud

### Day 55 — 2026-12-25
- **[STUDY] Learn: [Core] Light day: weak-topic review** (75m)
  Your weak-topic log
- **[PRACTICE] Hands-on: [Core] Light day: weak-topic review** (120m)
  BUFFER (first 2 hrs): catch up on anything missed this week. If nothing is missed, do: Redo the labs you found hardest Output: Runnable code/query or concise notes; capture one interview explanation and one common failure mode.
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Light: re-solve missed problems | SQL (15 min): 2 problems on gaps and islands | Interview (15 min): answer 5 questions aloud on 'Light day: weak-topic review'. | Optional: Flashcards

### Day 56 — 2026-12-26
- **[STUDY] Learn: [Core] Timed practice exam** (150m)
  Google PDE sample questions + practice tests
- **[PRACTICE] Hands-on: [Core] Timed practice exam** (240m)
  Take a timed practice exam; review every wrong answer Output: Exam score + weak-topic log
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Timed problem set 4 (45 min) | SQL (30 min): 2 problems on partition pruning + query cost | Interview (30 min): answer 5 questions aloud on 'Timed practice exam'. | Optional: Update weak-topic log

### Day 57 — 2026-12-27
- **[STUDY] Learn: [Core] Mock interview 2 (technical)** (150m)
  Mock with a friend or record yourself
- **[PRACTICE] Hands-on: [Core] Mock interview 2 (technical)** (240m)
  Full technical mock; fix gaps same day Output: Mock feedback log
- **[REVIEW] Python + SQL + interview drills** (90m)
  Python (30 min): Timed problem set 5 | SQL (30 min): 2 problems on joins + aggregations | Interview (30 min): answer 5 questions aloud on 'Mock interview 2 (technical)'. | Optional: Notes: feedback

### Day 58 — 2026-12-28
- **[STUDY] Learn: [Core] Resume + LinkedIn** (75m)
  Job postings keyword list
- **[PRACTICE] Hands-on: [Core] Resume + LinkedIn** (120m)
  Update resume with GCP skills and project bullets; LinkedIn headline Output: Updated resume + LinkedIn
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Fix weak spots | SQL (15 min): 2 problems on window functions | Interview (15 min): answer 5 questions aloud on 'Resume + LinkedIn'. | Optional: Peer review if possible

### Day 59 — 2026-12-29
- **[STUDY] Learn: [Core] Mock interview 3 (design + project)** (75m)
  Mock with a friend or record yourself
- **[PRACTICE] Hands-on: [Core] Mock interview 3 (design + project)** (120m)
  System design + project deep-dive mock Output: Mock feedback log
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Timed problem set 6 | SQL (15 min): 2 problems on CTEs + subqueries | Interview (15 min): answer 5 questions aloud on 'Mock interview 3 (design + project)'. | Optional: Notes: feedback

### Day 60 — 2026-12-30
- **[STUDY] Learn: [Core] Final revision sheet** (75m)
  All your notes
- **[PRACTICE] Hands-on: [Core] Final revision sheet** (120m)
  One-page service comparison + top-50 question sheet Output: One-page service comparison + top-50 question sheet
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Re-solve missed problems | SQL (15 min): 2 problems on dedup (latest record per key) | Interview (15 min): answer 5 questions aloud on 'Final revision sheet'. | Optional: Read it twice

### Day 61 — 2026-12-31
- **[STUDY] Learn: [Core] Wrap-up + application plan** (75m)
  Light review
- **[PRACTICE] Hands-on: [Core] Wrap-up + application plan** (120m)
  Review applications sent; plan the next batch and follow-ups Output: Application tracker with next batch planned
- **[REVIEW] Python + SQL + interview drills** (45m)
  Python (15 min): Final Python cheat sheet | SQL (15 min): 2 problems on MERGE + incremental loads | Interview (15 min): answer 5 questions aloud on 'Wrap-up + application plan'. | Optional: Rest early

