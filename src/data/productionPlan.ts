// Phase 2: "production-grade data engineer" plan, 1 Jan - 1 Mar 2027 (60 days).
// Builds on the Nov-Dec interview-prep plan by covering what it treats as awareness only
// or omits: testing, CI/CD, IaC, data quality, lakehouse, Kafka, observability, governance, FinOps.

import type { StudyTask } from '../types';
import type { PlanResource } from './gcpCurriculum';

export const PRODUCTION_START = '2027-01-01';
export const PRODUCTION_END = '2027-03-01';

interface Day {
  focus: string;
  learn: string;
  hands: string;
  yt: string;
  docs: [string, string];
}

interface Phase {
  name: string;
  drill: string;
  days: Day[];
}

const PHASES: Phase[] = [
  {
    name: 'Software engineering foundations',
    drill: 'Python (15 min): refactor yesterday\'s code, add type hints | SQL (15 min): 2 window-function problems | Interview (15 min): explain how you test and ship a pipeline',
    days: [
      { focus: '[Core] Git workflow and code review', learn: 'Pro Git: branching; trunk-based development; conventional commits', hands: 'Create the LARA repo with branch protection, PR template and pre-commit hooks; open and review one PR yourself', yt: 'trunk based development vs gitflow explained', docs: ['Pro Git book', 'https://git-scm.com/book/en/v2'] },
      { focus: '[Core] Python project structure, packaging, typing', learn: 'pyproject.toml, src layout, virtual envs, type hints, mypy basics', hands: 'Refactor the LARA ETL into an installable src/ package with typed functions; run mypy clean', yt: 'python project structure pyproject.toml src layout', docs: ['Python Packaging guide', 'https://packaging.python.org/en/latest/'] },
      { focus: '[Core] pytest fundamentals', learn: 'Fixtures, parametrize, tmp_path, markers, conftest', hands: 'Write unit tests for parsing/validation functions; reach 80% coverage on the transform layer', yt: 'pytest fixtures parametrize tutorial', docs: ['pytest docs', 'https://docs.pytest.org/en/stable/'] },
      { focus: '[Core] Testing data transformations', learn: 'Pure-function design, golden files, fakes for BigQuery/GCS, unit vs integration vs end-to-end', hands: 'Add a fake storage client and a golden-file test for one transformation; separate integration tests with a marker', yt: 'testing data pipelines python unit integration tests', docs: ['pytest docs', 'https://docs.pytest.org/en/stable/'] },
      { focus: '[Core] Logging, error handling, retries', learn: 'Structured JSON logging, exception hierarchy, exponential backoff with jitter, dead-letter pattern', hands: 'Add structured logging with correlation IDs and a retry decorator; route bad records to a dead-letter table', yt: 'python structured logging json best practices', docs: ['Python logging HOWTO', 'https://docs.python.org/3/howto/logging.html'] },
      { focus: '[Core] Docker for data applications', learn: 'Images, layers, multi-stage builds, non-root users, .dockerignore', hands: 'Containerise the ETL with a multi-stage slim image; compare image sizes', yt: 'docker multi stage build python best practices', docs: ['Docker docs', 'https://docs.docker.com/'] },
      { focus: '[Core] Docker Compose local data stack', learn: 'Compose services, volumes, networks, healthchecks', hands: 'Run Postgres + Airflow + your ETL locally with one command and a seeded dataset', yt: 'docker compose airflow postgres local development', docs: ['Docker Compose docs', 'https://docs.docker.com/compose/'] },
      { focus: '[Core] CI with GitHub Actions', learn: 'Workflows, jobs, matrix, caching, required checks', hands: 'Build a CI pipeline: ruff lint, mypy, pytest with coverage gate, Docker build on every PR', yt: 'github actions python ci pipeline tutorial', docs: ['GitHub Actions docs', 'https://docs.github.com/en/actions'] },
      { focus: '[Core] Secure CD to GCP', learn: 'Workload Identity Federation, Artifact Registry, no long-lived JSON keys', hands: 'Push the image to Artifact Registry from Actions using Workload Identity Federation', yt: 'github actions workload identity federation google cloud', docs: ['Workload Identity Federation', 'https://cloud.google.com/iam/docs/workload-identity-federation'] },
      { focus: '[Core] Checkpoint: production-ready repository', learn: 'Review: README, Makefile, CONTRIBUTING, versioning, changelog', hands: 'Make the repo clone-and-run in 5 minutes; green CI badge; write a 1-page engineering README', yt: 'what makes a good data engineering repository portfolio', docs: ['Python Packaging guide', 'https://packaging.python.org/en/latest/'] },
    ],
  },
  {
    name: 'Infrastructure as Code and environments',
    drill: 'Python (15 min): write a small CLI with argparse and tests | SQL (15 min): 2 CTE problems | Interview (15 min): how do you promote changes from dev to prod',
    days: [
      { focus: '[Core] Terraform fundamentals', learn: 'Providers, resources, variables, outputs, state, plan/apply', hands: 'Provision a GCS bucket and BigQuery dataset with Terraform using remote state in GCS', yt: 'terraform google cloud tutorial beginners', docs: ['Terraform Google provider', 'https://registry.terraform.io/providers/hashicorp/google/latest/docs'] },
      { focus: '[Core] Terraform modules and environments', learn: 'Modules, workspaces vs directories, tfvars, naming conventions', hands: 'Create a reusable data-platform module and instantiate dev and prod', yt: 'terraform modules environments dev prod best practices', docs: ['Terraform docs', 'https://developer.hashicorp.com/terraform/docs'] },
      { focus: '[Core] IAM as code and least privilege', learn: 'Service accounts per workload, IAM conditions, authoritative vs non-authoritative bindings', hands: 'Define per-pipeline service accounts with minimal roles in Terraform; test denied access', yt: 'gcp iam least privilege service accounts terraform', docs: ['Cloud IAM docs', 'https://cloud.google.com/iam/docs'] },
      { focus: '[Core] Terraform for the data platform', learn: 'Pub/Sub, BigQuery tables and schemas, Composer/Cloud Run via Terraform', hands: 'Provision Pub/Sub topics, subscriptions with dead-letter and BigQuery tables via Terraform', yt: 'terraform bigquery pubsub infrastructure as code', docs: ['Terraform Google provider', 'https://registry.terraform.io/providers/hashicorp/google/latest/docs'] },
      { focus: '[Core] CI/CD for infrastructure', learn: 'terraform plan on PR, apply on merge, policy checks, drift detection', hands: 'Add a plan-on-PR / apply-on-merge workflow with manual approval for prod', yt: 'terraform github actions plan apply pull request', docs: ['GitHub Actions docs', 'https://docs.github.com/en/actions'] },
      { focus: '[Core] Environment strategy and promotion', learn: 'Dev/stage/prod projects, config promotion, feature flags, rollbacks', hands: 'Split the project into dev and prod with identical Terraform; promote a pipeline change', yt: 'data engineering environments dev staging prod strategy', docs: ['Cloud Build docs', 'https://cloud.google.com/build/docs'] },
      { focus: '[Core] Checkpoint: whole platform from code', learn: 'Review: destroy and recreate everything from scratch', hands: 'Tear down and rebuild the dev platform from Terraform only; document the runbook and measure time', yt: 'infrastructure as code disaster recovery rebuild', docs: ['Terraform docs', 'https://developer.hashicorp.com/terraform/docs'] },
    ],
  },
  {
    name: 'Data quality, testing and contracts',
    drill: 'Python (15 min): write a validator class with tests | SQL (15 min): data-quality queries (nulls, duplicates, orphans) | Interview (15 min): how do you know your data is correct',
    days: [
      { focus: '[Core] Data quality dimensions and strategy', learn: 'Completeness, validity, uniqueness, freshness, consistency; where to test (ingest, transform, serve)', hands: 'Write a data-quality spec for LARA: 15 checks mapped to layers with owners and severity', yt: 'data quality dimensions data engineering explained', docs: ['Great Expectations docs', 'https://docs.greatexpectations.io/'] },
      { focus: '[Core] Great Expectations or Soda checks', learn: 'Expectation suites, checkpoints, running inside pipelines', hands: 'Add checks to the ingest step; fail fast on critical rules and warn on soft ones', yt: 'great expectations tutorial data pipeline', docs: ['Great Expectations docs', 'https://docs.greatexpectations.io/'] },
      { focus: '[Core] dbt or Dataform tests and documentation', learn: 'Generic and singular tests, sources, freshness, docs, exposures', hands: 'Add unique/not_null/relationships and a custom test to the models; generate docs', yt: 'dbt tests data quality tutorial', docs: ['dbt docs', 'https://docs.getdbt.com/'] },
      { focus: '[Core] Data contracts and schema evolution', learn: 'Producer/consumer contracts, backward/forward compatibility, versioning, breaking changes', hands: 'Write a data contract for the shipment event; add a CI check that blocks breaking schema changes', yt: 'data contracts explained schema evolution', docs: ['Data Contract spec', 'https://datacontract.com/'] },
      { focus: '[Core] Idempotency, backfills, reprocessing', learn: 'Idempotent writes, partition overwrite, watermarking, replay from raw', hands: 'Make every job rerunnable; run a 30-day backfill and prove there are no duplicates', yt: 'idempotent data pipelines backfill best practices', docs: ['BigQuery docs', 'https://cloud.google.com/bigquery/docs'] },
      { focus: '[Core] Data observability and anomaly detection', learn: 'Freshness, volume, schema and distribution monitors; alert routing', hands: 'Build volume and freshness monitors in BigQuery with scheduled queries and alerts', yt: 'data observability freshness volume monitoring', docs: ['Cloud Monitoring docs', 'https://cloud.google.com/monitoring/docs'] },
      { focus: '[Core] Checkpoint: quality gate in CI/CD', learn: 'Review: quality gates, failure handling, incident notes', hands: 'Wire quality checks into the DAG and CI; inject a bad file and show it quarantined with an alert', yt: 'data quality gates ci cd pipeline', docs: ['Great Expectations docs', 'https://docs.greatexpectations.io/'] },
    ],
  },
  {
    name: 'Transformation, modelling and lakehouse',
    drill: 'Python (15 min): implement a deduplication function | SQL (15 min): SCD2 and gaps-and-islands | Interview (15 min): justify a modelling choice',
    days: [
      { focus: '[Core] Dimensional modelling in practice', learn: 'Facts, dimensions, grain, conformed dimensions, Kimball vs Inmon vs Data Vault', hands: 'Design a star schema for logistics tracking and write the DDL with partitioning and clustering', yt: 'dimensional modeling kimball star schema tutorial', docs: ['BigQuery docs', 'https://cloud.google.com/bigquery/docs'] },
      { focus: '[Core] dbt project structure and layers', learn: 'staging / intermediate / marts, naming, materializations, incremental models', hands: 'Restructure transformations into layered models with incremental loads', yt: 'dbt project structure staging marts incremental models', docs: ['dbt docs', 'https://docs.getdbt.com/'] },
      { focus: '[Core] Incremental processing and SCD2', learn: 'Incremental strategies, merge, snapshots, late-arriving data', hands: 'Implement SCD2 snapshot and handle a late-arriving record correctly', yt: 'dbt snapshots slowly changing dimensions incremental', docs: ['dbt docs', 'https://docs.getdbt.com/'] },
      { focus: '[Working] Open table formats: Iceberg and Delta', learn: 'Snapshots, ACID on object storage, time travel, partition evolution, compaction', hands: 'Create an Iceberg table via BigLake/Spark, evolve its schema, time-travel query', yt: 'apache iceberg tutorial lakehouse explained', docs: ['Apache Iceberg docs', 'https://iceberg.apache.org/docs/latest/'] },
      { focus: '[Working] Medallion architecture and storage layout', learn: 'Bronze/silver/gold, file sizing, small-file problem, compaction, retention', hands: 'Implement bronze/silver/gold for LARA with lifecycle rules and a retention policy', yt: 'medallion architecture bronze silver gold data engineering', docs: ['Cloud Storage docs', 'https://cloud.google.com/storage/docs'] },
      { focus: '[Core] Performance and cost engineering in BigQuery', learn: 'Slots vs on-demand, materialized views, clustering strategy, partition pruning', hands: 'Benchmark 3 slow queries; cut bytes scanned by at least 50% and record before/after', yt: 'bigquery performance optimization cost reduction', docs: ['BigQuery reservations', 'https://cloud.google.com/bigquery/docs/reservations-intro'] },
      { focus: '[Core] Checkpoint: modelling review', learn: 'Review: defend schema, grain and incremental design out loud', hands: 'Present the model to a rubber duck or recording; fix the 3 weakest decisions', yt: 'data modeling interview questions data engineer', docs: ['dbt docs', 'https://docs.getdbt.com/'] },
    ],
  },
  {
    name: 'Streaming in production (Kafka, Pub/Sub, Beam)',
    drill: 'Python (15 min): write a consumer with commit logic | SQL (15 min): sessionization query | Interview (15 min): exactly-once vs at-least-once trade-offs',
    days: [
      { focus: '[Core] Kafka fundamentals', learn: 'Topics, partitions, offsets, consumer groups, retention, compaction, replication', hands: 'Run Kafka in Docker; produce and consume LARA events; observe rebalancing', yt: 'apache kafka fundamentals tutorial', docs: ['Kafka docs', 'https://kafka.apache.org/documentation/'] },
      { focus: '[Core] Kafka vs Pub/Sub and delivery semantics', learn: 'Ordering, partitioning keys, at-least-once, exactly-once, idempotent producers', hands: 'Write a comparison table and implement an idempotent consumer', yt: 'kafka vs google pubsub differences', docs: ['Pub/Sub docs', 'https://cloud.google.com/pubsub/docs'] },
      { focus: '[Core] Schemas for streams', learn: 'Avro/Protobuf, schema registry, compatibility modes, Pub/Sub schemas', hands: 'Attach an Avro schema to a Pub/Sub topic and test a compatible and a breaking change', yt: 'avro schema registry compatibility explained', docs: ['Pub/Sub schemas', 'https://cloud.google.com/pubsub/docs/schemas'] },
      { focus: '[Core] Beam windowing, triggers, late data', learn: 'Event vs processing time, watermarks, allowed lateness, accumulation modes', hands: 'Build a windowed aggregation with late-data handling and test with TestStream', yt: 'apache beam windows watermarks triggers explained', docs: ['Dataflow docs', 'https://cloud.google.com/dataflow/docs'] },
      { focus: '[Core] Production Dataflow: flex templates, scaling, cost', learn: 'Flex templates, autoscaling, Streaming Engine, update vs drain, worker sizing', hands: 'Package the pipeline as a flex template; deploy via CI; do a safe update/drain', yt: 'dataflow flex templates streaming engine autoscaling', docs: ['Dataflow docs', 'https://cloud.google.com/dataflow/docs'] },
      { focus: '[Core] Streaming failure handling', learn: 'Poison messages, dead-letter topics, backpressure, replay, ordering bugs', hands: 'Inject poison messages and a downstream outage; show DLQ, replay and no data loss', yt: 'streaming pipeline dead letter queue replay backpressure', docs: ['Pub/Sub dead-letter', 'https://cloud.google.com/pubsub/docs/handling-failures'] },
      { focus: '[Core] Checkpoint: end-to-end streaming slice', learn: 'Review: latency, throughput, cost per million events', hands: 'Load-test with 1M synthetic events; report p95 latency and cost; document limits', yt: 'streaming data pipeline load testing latency', docs: ['Dataflow docs', 'https://cloud.google.com/dataflow/docs'] },
    ],
  },
  {
    name: 'Orchestration, reliability and observability',
    drill: 'Python (15 min): write an Airflow task with retries and tests | SQL (15 min): SLA breach queries | Interview (15 min): walk through an incident you handled or simulated',
    days: [
      { focus: '[Core] Production Airflow design', learn: 'Idempotent tasks, task granularity, pools, sensors vs deferrable operators, dynamic task mapping', hands: 'Refactor the DAG for idempotency and deferrable sensors; add DAG-integrity tests in CI', yt: 'airflow best practices production dags', docs: ['Airflow docs', 'https://airflow.apache.org/docs/'] },
      { focus: '[Core] Airflow testing, deployment, backfills', learn: 'DAG tests, CI deploy to Composer, catchup, backfill, clearing tasks', hands: 'Deploy DAGs to Composer from CI and run a controlled backfill', yt: 'airflow dag testing ci cd composer deploy', docs: ['Cloud Composer docs', 'https://cloud.google.com/composer/docs'] },
      { focus: '[Core] SLIs, SLOs and alerting for data', learn: 'Freshness/latency/quality SLIs, error budgets, alert fatigue, runbooks', hands: 'Define 3 SLOs for LARA; create alerts with runbook links', yt: 'sre slo sli error budget explained', docs: ['Google SRE book', 'https://sre.google/sre-book/table-of-contents/'] },
      { focus: '[Core] Monitoring and logging on GCP', learn: 'Cloud Monitoring, log-based metrics, dashboards, uptime checks, log sinks to BigQuery', hands: 'Build a pipeline-health dashboard and log-based metrics; route alerts to Slack or email', yt: 'google cloud monitoring dashboards alerting log based metrics', docs: ['Cloud Monitoring docs', 'https://cloud.google.com/monitoring/docs'] },
      { focus: '[Core] Lineage and metadata', learn: 'Column-level lineage, OpenLineage, Dataplex lineage, catalog, impact analysis', hands: 'Enable lineage for the pipeline and use it to trace the impact of a column change', yt: 'data lineage openlineage dataplex explained', docs: ['OpenLineage docs', 'https://openlineage.io/docs/'] },
      { focus: '[Core] Incident response and postmortems', learn: 'On-call basics, triage, blameless postmortems, runbooks, DR and RTO/RPO', hands: 'Simulate a bad deploy; write a postmortem with timeline, root cause and actions', yt: 'blameless postmortem incident response data engineering', docs: ['Google SRE book', 'https://sre.google/sre-book/table-of-contents/'] },
      { focus: '[Core] Checkpoint: game day', learn: 'Review: failure modes across ingestion, processing, serving', hands: 'Run a game day: kill a component, corrupt a file, expire a credential; record detection and recovery times', yt: 'chaos engineering game day data pipelines', docs: ['Cloud Monitoring docs', 'https://cloud.google.com/monitoring/docs'] },
    ],
  },
  {
    name: 'Security, governance and FinOps',
    drill: 'Python (15 min): mask/hash PII in a DataFrame | SQL (15 min): row- and column-level security policies | Interview (15 min): how do you control access and cost',
    days: [
      { focus: '[Core] Data security architecture', learn: 'Encryption at rest/in transit, CMEK, secrets, VPC Service Controls, private access', hands: 'Enable CMEK on a dataset; keep secrets in Secret Manager; review exposure paths', yt: 'gcp data security cmek vpc service controls', docs: ['VPC Service Controls', 'https://cloud.google.com/vpc-service-controls/docs'] },
      { focus: '[Core] Fine-grained access in BigQuery', learn: 'Row-level security, column-level policy tags, authorized views, data masking', hands: 'Implement policy tags and row policies; verify with two test identities', yt: 'bigquery row level security column level policy tags', docs: ['BigQuery security', 'https://cloud.google.com/bigquery/docs/data-governance'] },
      { focus: '[Core] PII handling and compliance basics', learn: 'DLP discovery, tokenization, pseudonymisation, retention, GDPR right to erasure', hands: 'Scan a dataset with Sensitive Data Protection; implement tokenisation and a deletion workflow', yt: 'gdpr data engineering pii tokenization', docs: ['Sensitive Data Protection', 'https://cloud.google.com/sensitive-data-protection/docs'] },
      { focus: '[Working] Governance with Dataplex', learn: 'Lakes/zones, data profiling, quality scans, business glossary, catalog', hands: 'Run a Dataplex data-quality scan and publish catalog entries with owners', yt: 'dataplex data governance data quality tutorial', docs: ['Dataplex docs', 'https://cloud.google.com/dataplex/docs'] },
      { focus: '[Core] Cost management and FinOps', learn: 'Labels, budgets, billing export, slot vs on-demand, storage tiers, query guardrails', hands: 'Export billing to BigQuery; build a cost-per-pipeline report; set per-user query limits', yt: 'gcp finops cost optimization bigquery billing export', docs: ['Cloud Billing docs', 'https://cloud.google.com/billing/docs'] },
      { focus: '[Core] Audit, access reviews, supply chain', learn: 'Audit logs, access reviews, dependency scanning, image scanning, SBOM', hands: 'Enable audit logs sink; add dependency and image scanning to CI', yt: 'software supply chain security dependency scanning ci', docs: ['Cloud Audit Logs', 'https://cloud.google.com/logging/docs/audit'] },
      { focus: '[Core] Checkpoint: security and cost review', learn: 'Review: threat model and cost model for the platform', hands: 'Write a 2-page threat model and monthly cost estimate; fix the top 3 risks', yt: 'threat modeling data platform', docs: ['Cloud IAM docs', 'https://cloud.google.com/iam/docs'] },
    ],
  },
  {
    name: 'Capstone hardening, system design and job readiness',
    drill: 'Python (15 min): timed coding problem | SQL (15 min): timed query set | Interview (15 min): system design out loud, 5 min structure + trade-offs',
    days: [
      { focus: '[Core] Scale and distributed-systems concepts', learn: 'Partitioning, replication, consistency, CAP, backpressure, skew', hands: 'Identify the 3 scalability limits of LARA and test the first one with 10x data', yt: 'distributed systems concepts for data engineers', docs: ['Spark docs', 'https://spark.apache.org/docs/latest/'] },
      { focus: '[Working] Containers on GKE and Cloud Run', learn: 'Pods, deployments, jobs/cronjobs, resource limits, Cloud Run jobs vs GKE', hands: 'Run the batch ETL as a Cloud Run job and as a Kubernetes CronJob; compare', yt: 'kubernetes cronjob data pipeline gke basics', docs: ['GKE docs', 'https://cloud.google.com/kubernetes-engine/docs'] },
      { focus: '[Core] Capstone: production readiness review', learn: 'Checklist: tests, CI/CD, IaC, quality gates, SLOs, runbooks, security, cost', hands: 'Score LARA against a 30-point production-readiness checklist; open issues for each gap', yt: 'production readiness review checklist', docs: ['Google SRE book', 'https://sre.google/sre-book/table-of-contents/'] },
      { focus: '[Core] Capstone: close the gaps (1)', learn: 'Prioritise by risk; fix reliability and data-correctness first', hands: 'Fix the top 5 gaps from the review with PRs and tests', yt: 'technical debt prioritization engineering', docs: ['GitHub Actions docs', 'https://docs.github.com/en/actions'] },
      { focus: '[Core] Capstone: close the gaps (2)', learn: 'Documentation as a deliverable: architecture, ADRs, runbooks', hands: 'Write 5 architecture decision records and an on-call runbook', yt: 'architecture decision records adr tutorial', docs: ['ADR guide', 'https://adr.github.io/'] },
      { focus: '[Core] Capstone: demo and metrics', learn: 'Storytelling with numbers: latency, cost, quality, reliability', hands: 'Record a 5-minute demo; publish a metrics table (cost, p95, DQ pass rate, MTTR)', yt: 'how to present data engineering project portfolio', docs: ['Cloud Monitoring docs', 'https://cloud.google.com/monitoring/docs'] },
      { focus: '[Core] System design: batch warehouse', learn: 'Requirements, ingestion, storage, modelling, serving, failure and cost', hands: 'Design a batch analytics platform on a whiteboard in 40 min; self-review against the checklist', yt: 'data engineering system design interview batch warehouse', docs: ['BigQuery docs', 'https://cloud.google.com/bigquery/docs'] },
      { focus: '[Core] System design: real-time pipeline', learn: 'Event ingestion, ordering, windowing, serving layer, replay, exactly-once', hands: 'Design a real-time pipeline in 40 min; list 5 failure modes and mitigations', yt: 'system design real time data pipeline interview', docs: ['Dataflow docs', 'https://cloud.google.com/dataflow/docs'] },
    ],
  },
];

function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

function build() {
  const tasks: Omit<StudyTask, 'id'>[] = [];
  const resources: Record<string, PlanResource[]> = {};
  let i = 0;
  for (const phase of PHASES) {
    for (const day of phase.days) {
      const date = addDays(PRODUCTION_START, i++);
      const weekend = weekday(date) === 0 || weekday(date) === 6;
      const study = weekend ? 150 : 75;
      const review = weekend ? 90 : 45;
      const practice = (weekend ? 480 : 240) - study - review;
      tasks.push(
        { date, title: `Learn: ${day.focus}`, description: `${day.learn}\n\nPhase: ${phase.name}`, durationMinutes: study, category: 'study', completed: false },
        { date, title: `Hands-on: ${day.focus}`, description: day.hands, durationMinutes: practice, category: 'practice', completed: false },
        { date, title: 'Python + SQL + interview drills', description: phase.drill, durationMinutes: review, category: 'review', completed: false },
      );
      const links: PlanResource[] = [
        { label: `YouTube: ${day.yt}`, url: yt(day.yt) },
        { label: `Docs: ${day.docs[0]}`, url: day.docs[1] },
      ];
      resources[`${date}|study`] = links;
      resources[`${date}|practice`] = [links[1]];
    }
  }
  return { tasks, resources };
}

const built = build();

export const PRODUCTION_CURRICULUM = built.tasks;
export const PRODUCTION_RESOURCES = built.resources;
