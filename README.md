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

### 4. Settings & Storage Management (`Settings`)
- **Curriculum Details:** Start date (`Nov 1, 2026`), target completion date (`Dec 31, 2026`), pace (`3 tasks/day`).
- **Demo Progress Seeder:** One-tap button to pre-fill Days 1–15 as completed so you can immediately preview streaks, heatmap cells, and analytics.
- **Data Reset:** Restore the app back to initial Day 1 state anytime.
- **Offline Persistence:** All state is saved locally via `@react-native-async-storage/async-storage`.
