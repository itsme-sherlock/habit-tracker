# DE60 — 60-Day Study Tracker (Mobile App for Expo Go)

A React Native mobile application built with Expo for the **60-Day Data Engineering Certification Prep Plan (Nov 1 – Dec 31, 2026)**, inspired by and ported from [itsme-sherlock/habit-tracker](https://github.com/itsme-sherlock/habit-tracker).

Designed with the **"Midnight Pipeline"** technical aesthetic (`#0B1220` deep dark terminal background, flow cyan `#00D4AA`, warning amber `#FFB800`, and calm blue `#3B82F6`).

---

## 🚀 How to Preview in Expo Go

1. **Open a terminal in the project directory:**
   ```bash
   cd C:\Users\PC\.gemini\antigravity\scratch\de60-habit-tracker
   ```

2. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

3. **Scan with your phone:**
   - **Android:** Open the **Expo Go** app and tap **"Scan QR code"**.
   - **iOS:** Open the native **Camera** app, point it at the QR code in your terminal, and tap the prompt to open in Expo Go.
   - **Web / Emulator:** You can also press `w` to open in a web browser, `a` for Android Emulator, or `i` for iOS Simulator.

---

## 📱 Core Features

### 1. Today Screen (`Today`)
- **Pipeline Progression Hero:**
  - Real-time indicator of current day (e.g. Day 16 of 61).
  - Overall syllabus completion percentage.
  - Active streak counter and total study hours logged.
  - Visual horizontal pipeline progression bar with key milestones (Nov 1, Day 15, Midpoint D30, Sprint D45, Dec 31).
- **Core Curriculum Tasks (3 tasks per day):**
  - **Learn:** Core concepts & GCP cloud architecture (~75–150 min).
  - **Hands-on:** Hands-on labs, runnable code, and cloud build projects (~120–240 min).
  - **Drills:** Python scripting, LeetCode SQL challenges, and mock interview questions (~45–90 min).
  - **Interactive task details:** Expand each card for full instructions, expected deliverables, and clickable direct resource links (Google Cloud Documentation, YouTube video walkthroughs, and LeetCode problems).
- **Daily Micro-Habits (4 baseline habits):**
  - Study GCP Concepts (target 2 hrs)
  - Hands-on Practice (target 1 hr)
  - Review & Flashcards (target 30 min)
  - Mock Questions (target 10 questions)
  - Interactive `+` / `-` steppers with live progress fill bars.
- **Daily Reflection & Mood Log:**
  - 5-point mood logger (Drained, Struggling, Steady, Focused, Crushed it).
  - Daily takeaway notes saved automatically to local storage.

### 2. Schedule & Curriculum Explorer (`Schedule`)
- Browse all **61 days (Nov 1 to Dec 31)** and **183 tasks**.
- **Instant Search:** Find topics by keyword (e.g., `BigQuery`, `Dataflow`, `IAM`, `Kafka`, `dbt`, `Pub/Sub`, `Window functions`).
- **Week Filters:** Quick filter pills from `Week 1` to `Week 9`.
- Day cards showing completion status (`3/3 Done`), expandable task previews, and one-tap **"Open"** to jump to that day in the main view.

### 3. Observability & Analytics (`Analytics`)
- **Exam Readiness Score:** Dynamic readiness percentage calculated based on syllabus progress and habits.
- **60-Day Pipeline Heatmap Grid:** 61-day visual cell matrix indicating completed, partial, and pending days.
- **Throughput by Category:** Visual progress meters for Learn, Hands-on, and Review drills.
- **Total Hours & Remaining Tasks:** High-level metrics tracking overall effort.

### 4. Interactive Calendar Modal & Quick Navigation
- **Calendar Picker:** Tap the date button or the `DAY X OF 61` badge in the top navigation bar to open a full month calendar.
- **Visual Status Badges:**
  - 🟢 **Green:** Day fully completed.
  - 🟡 **Accent Yellow:** Currently selected date.
  - 🔴 **Red Outline:** Missed/overdue past date.
  - 🔵 **Cyan Border:** Today's date.
- **60-Day Badges:** Every date inside the study plan has a badge (`D1`–`D61`).
- **Quick Actions:** One-tap **"Catch Up: Day X"** button jumps directly to your first missed day; **"Jump to Today"** brings you right back.

### 5. Catch-Up Radar & Backlog Tracker
- Automatically computes if you are behind schedule.
- Precisely identifies:
  - When you fell off track (e.g. *Day 1, Nov 1, 2026*).
  - Total overdue incomplete tasks across all missed days.
- Provides a one-tap **"Jump to Day X to Catch Up"** action.
- Shows **"Pace On Track • No overdue backlog"** when caught up.

### 6. Model Context Protocol (MCP) Server
Integrates your study tracker with any AI application (Antigravity, Claude Desktop, Cursor, Copilot, etc.) so AI agents can monitor your progress, tell you what you missed, generate technical study notes, and sync completions to Supabase.

#### Available MCP Tools:
1. `get_study_status`: Progress %, streak, exact missed date (`missedSince`), backlog hours, and priority tasks.
2. `get_catchup_plan`: Actionable catch-up roadmap with daily extra hours calculation.
3. `get_daily_curriculum`: Full tasks, subtasks, descriptions for any day (1..61) or date.
4. `generate_study_notes`: Produces 4-YoE study notes and saves to `notes/YYYY-MM-DD.md` + Supabase.
5. `mark_task_completed`: Updates task completion in Supabase and syncs to your phone.

#### Connecting MCP to Claude Desktop or Cursor:
Add to your `claude_desktop_config.json` or Cursor MCP settings:
```json
{
  "mcpServers": {
    "de60-habit-tracker": {
      "command": "node",
      "args": ["C:\\Users\\PC\\.gemini\\antigravity\\scratch\\de60-habit-tracker\\scripts\\mcp-server.js"],
      "env": {
        "SUPABASE_URL": "https://uxbmfsbqpqlrsftmdyfl.supabase.co",
        "SUPABASE_ANON_KEY": "sb_publishable_r5UaMPSlVgOC37a7L5wotA_WWz7l9wB"
      }
    }
  }
}
```

### 7. Settings & Storage Management (`Settings`)
- **Curriculum Details:** Start date (`Nov 1, 2026`), target completion date (`Dec 31, 2026`), pace (`3 tasks/day`).
- **Demo Progress Seeder:** One-tap button to pre-fill Days 1–15 as completed so you can immediately preview streaks, heatmap cells, and analytics.
- **Data Reset:** Restore the app back to initial Day 1 state anytime.
- **Offline Persistence & Cloud Sync:** Local persistence via `@react-native-async-storage/async-storage` and bidirectional cloud sync with Supabase PostgreSQL.
