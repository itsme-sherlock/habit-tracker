"""Supabase database connection and queries."""
from __future__ import annotations
import os
from datetime import date, datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client
from .models import (
    Habit, HabitCreate, HabitUpdate,
    StudyTask, StudyTaskCreate, StudyTaskUpdate,
    DailyCompletion, DailyCompletionCreate,
    TodayPlan, StreakInfo, WeeklyStats,
    Category
)


class Database:
    """Wrapper for Supabase operations."""

    def __init__(self, url: str, key: str, user_id: str):
        self.client: Client = create_client(url, key)
        self.user_id = user_id

    # ==================== HABITS ====================

    async def list_habits(self) -> List[Habit]:
        """Get all habits for the user, ordered by 'order' field."""
        result = self.client.table("habits") \
            .select("*") \
            .eq("user_id", self.user_id) \
            .order("order") \
            .execute()
        return [Habit(**row) for row in result.data]

    async def get_habit(self, habit_id: str) -> Optional[Habit]:
        """Get a single habit by ID."""
        result = self.client.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", self.user_id) \
            .single() \
            .execute()
        return Habit(**result.data) if result.data else None

    async def create_habit(self, habit: HabitCreate) -> Habit:
        """Create a new habit."""
        # Get max order for new habit
        habits = await self.list_habits()
        new_order = max((h.order for h in habits), default=-1) + 1

        data = habit.model_dump()
        data["user_id"] = self.user_id
        data["order"] = new_order

        result = self.client.table("habits").insert(data).execute()
        return Habit(**result.data[0])

    async def update_habit(self, habit_id: str, update: HabitUpdate) -> Optional[Habit]:
        """Update a habit."""
        data = update.model_dump(exclude_unset=True)
        data["updated_at"] = datetime.utcnow().isoformat()

        result = self.client.table("habits") \
            .update(data) \
            .eq("id", habit_id) \
            .eq("user_id", self.user_id) \
            .execute()
        return Habit(**result.data[0]) if result.data else None

    async def delete_habit(self, habit_id: str) -> bool:
        """Delete a habit."""
        result = self.client.table("habits") \
            .delete() \
            .eq("id", habit_id) \
            .eq("user_id", self.user_id) \
            .execute()
        return len(result.data) > 0

    async def reorder_habits(self, habit_ids: List[str]) -> List[Habit]:
        """Reorder habits by their order in the list."""
        updates = []
        for idx, habit_id in enumerate(habit_ids):
            updates.append({"id": habit_id, "order": idx, "updated_at": datetime.utcnow().isoformat()})

        # Bulk update using upsert
        result = self.client.table("habits").upsert(updates).execute()
        return [Habit(**row) for row in result.data]

    async def increment_habit_today(self, habit_id: str) -> Dict[str, int]:
        """Increment today's completion count for a habit."""
        today = date.today().isoformat()
        # Get current completion
        completion = await self.get_completion(today)
        current = completion.habit_completions.get(habit_id, 0) if completion else 0
        new_count = current + 1

        # Update or create completion
        await self.upsert_completion(DailyCompletionCreate(
            date=date.today(),
            habit_completions={habit_id: new_count},
            task_completions=completion.task_completions if completion else [],
            notes=completion.notes if completion else None,
            mood=completion.mood if completion else None,
        ))
        return {habit_id: new_count}

    async def decrement_habit_today(self, habit_id: str) -> Dict[str, int]:
        """Decrement today's completion count for a habit."""
        today = date.today().isoformat()
        completion = await self.get_completion(today)
        current = completion.habit_completions.get(habit_id, 0) if completion else 0
        new_count = max(0, current - 1)

        await self.upsert_completion(DailyCompletionCreate(
            date=date.today(),
            habit_completions={habit_id: new_count},
            task_completions=completion.task_completions if completion else [],
            notes=completion.notes if completion else None,
            mood=completion.mood if completion else None,
        ))
        return {habit_id: new_count}

    # ==================== STUDY TASKS ====================

    async def list_tasks(self, target_date: Optional[date] = None) -> List[StudyTask]:
        """Get tasks for a specific date (default today)."""
        target = target_date or date.today()
        result = self.client.table("study_tasks") \
            .select("*") \
            .eq("date", target.isoformat()) \
            .eq("user_id", self.user_id) \
            .execute()
        return [StudyTask(**row) for row in result.data]

    async def list_tasks_range(self, start_date: date, end_date: date) -> List[StudyTask]:
        """Get tasks for a date range."""
        result = self.client.table("study_tasks") \
            .select("*") \
            .eq("user_id", self.user_id) \
            .gte("date", start_date.isoformat()) \
            .lte("date", end_date.isoformat()) \
            .order("date") \
            .execute()
        return [StudyTask(**row) for row in result.data]

    async def create_task(self, task: StudyTaskCreate) -> StudyTask:
        """Create a new study task."""
        data = task.model_dump()
        data["user_id"] = self.user_id
        data["date"] = task.date.isoformat()

        result = self.client.table("study_tasks").insert(data).execute()
        return StudyTask(**result.data[0])

    async def bulk_create_tasks(self, tasks: List[StudyTaskCreate]) -> List[StudyTask]:
        """Create multiple tasks at once."""
        data = []
        for task in tasks:
            d = task.model_dump()
            d["user_id"] = self.user_id
            d["date"] = task.date.isoformat()
            data.append(d)

        result = self.client.table("study_tasks").insert(data).execute()
        return [StudyTask(**row) for row in result.data]

    async def update_task(self, task_id: str, update: StudyTaskUpdate) -> Optional[StudyTask]:
        """Update a study task."""
        data = update.model_dump(exclude_unset=True)
        data["updated_at"] = datetime.utcnow().isoformat()

        if "completed" in data and data["completed"]:
            data["completed_at"] = datetime.utcnow().isoformat()
        elif "completed" in data and not data["completed"]:
            data["completed_at"] = None

        if "date" in data and isinstance(data["date"], date):
            data["date"] = data["date"].isoformat()

        result = self.client.table("study_tasks") \
            .update(data) \
            .eq("id", task_id) \
            .eq("user_id", self.user_id) \
            .execute()
        return StudyTask(**result.data[0]) if result.data else None

    async def delete_task(self, task_id: str) -> bool:
        """Delete a study task."""
        result = self.client.table("study_tasks") \
            .delete() \
            .eq("id", task_id) \
            .eq("user_id", self.user_id) \
            .execute()
        return len(result.data) > 0

    async def toggle_task(self, task_id: str, completed: bool) -> Optional[StudyTask]:
        """Toggle task completion."""
        return await self.update_task(task_id, StudyTaskUpdate(completed=completed))

    # ==================== COMPLETIONS ====================

    async def get_completion(self, target_date: str | date) -> Optional[DailyCompletion]:
        """Get completion for a specific date."""
        d = target_date.isoformat() if isinstance(target_date, date) else target_date
        result = self.client.table("daily_completions") \
            .select("*") \
            .eq("date", d) \
            .eq("user_id", self.user_id) \
            .single() \
            .execute()
        return DailyCompletion(**result.data) if result.data else None

    async def get_today_completion(self) -> Optional[DailyCompletion]:
        """Get today's completion."""
        return await self.get_completion(date.today())

    async def list_completions(self, start_date: date, end_date: date) -> List[DailyCompletion]:
        """Get completions for a date range."""
        result = self.client.table("daily_completions") \
            .select("*") \
            .eq("user_id", self.user_id) \
            .gte("date", start_date.isoformat()) \
            .lte("date", end_date.isoformat()) \
            .order("date") \
            .execute()
        return [DailyCompletion(**row) for row in result.data]

    async def upsert_completion(self, completion: DailyCompletionCreate) -> DailyCompletion:
        """Create or update a daily completion."""
        data = completion.model_dump()
        data["user_id"] = self.user_id
        data["date"] = completion.date.isoformat()
        data["completed_at"] = datetime.utcnow().isoformat()

        # Upsert (insert or update)
        result = self.client.table("daily_completions").upsert(data).execute()
        return DailyCompletion(**result.data[0])

    async def complete_day(self, completion: DailyCompletionCreate) -> DailyCompletion:
        """Save end-of-day completion."""
        return await self.upsert_completion(completion)

    # ==================== PLANS & STATS ====================

    async def get_today_plan(self) -> TodayPlan:
        """Get full plan for today: habits, tasks, and completion."""
        today = date.today()
        habits, tasks, completion = await self._get_plan_data(today)
        return TodayPlan(date=today, habits=habits, tasks=tasks, completion=completion)

    async def get_week_plan(self, week_start: date) -> List[TodayPlan]:
        """Get plan for a week."""
        from datetime import timedelta
        plans = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            habits, tasks, completion = await self._get_plan_data(day)
            plans.append(TodayPlan(date=day, habits=habits, tasks=tasks, completion=completion))
        return plans

    async def _get_plan_data(self, target_date: date) -> tuple[List[Habit], List[StudyTask], Optional[DailyCompletion]]:
        """Helper to get habits, tasks, and completion for a date."""
        habits = await self.list_habits()
        tasks = await self.list_tasks(target_date)
        completion = await self.get_completion(target_date)
        return habits, tasks, completion

    async def get_streaks(self) -> List[StreakInfo]:
        """Calculate streaks for all habits."""
        habits = await self.list_habits()
        completions = await self.list_completions(
            date.today().replace(day=1),  # First of current month
            date.today()
        )

        streaks = []
        for habit in habits:
            current_streak = 0
            longest_streak = 0
            last_completed = None

            # Check each day from today backwards
            check_date = date.today()
            while True:
                comp = next((c for c in completions if c.date == check_date), None)
                count = comp.habit_completions.get(habit.id, 0) if comp else 0

                if count >= habit.target_count:
                    current_streak += 1
                    if not last_completed:
                        last_completed = check_date
                else:
                    break

                check_date = check_date.replace(day=check_date.day - 1)
                if check_date.day > 28:  # Month boundary
                    break

            # Calculate longest streak (simplified - would need full history)
            longest_streak = max(longest_streak, current_streak)

            streaks.append(StreakInfo(
                habit_id=habit.id,
                habit_name=habit.name,
                current_streak=current_streak,
                longest_streak=longest_streak,
                last_completed_date=last_completed
            ))

        return streaks

    async def get_weekly_stats(self, week_start: date) -> WeeklyStats:
        """Get weekly statistics."""
        from datetime import timedelta
        week_end = week_start + timedelta(days=6)

        completions = await self.list_completions(week_start, week_end)
        tasks = await self.list_tasks_range(week_start, week_end)
        habits = await self.list_habits()

        total_habits = len(habits) * 7
        total_tasks = len(tasks)

        completed_habits = 0
        completed_tasks = 0
        total_study_minutes = 0
        daily_breakdown = {}

        for comp in completions:
            day_str = comp.date.isoformat()
            habit_done = sum(1 for h in habits if comp.habit_completions.get(h.id, 0) >= h.target_count)
            task_done = len(comp.task_completions)
            completed_habits += habit_done
            completed_tasks += task_done

            day_tasks = [t for t in tasks if t.date == comp.date]
            study_min = sum(t.duration_minutes for t in day_tasks if t.completed or t.id in comp.task_completions)
            total_study_minutes += study_min

            daily_breakdown[day_str] = {
                "habits_completed": habit_done,
                "tasks_completed": task_done,
                "study_minutes": study_min,
                "mood": comp.mood
            }

        return WeeklyStats(
            week_start=week_start,
            week_end=week_end,
            total_habits=total_habits,
            total_tasks=total_tasks,
            completed_habits=completed_habits,
            completed_tasks=completed_tasks,
            total_study_hours=round(total_study_minutes / 60, 1),
            completion_rate=round((completed_habits + completed_tasks) / (total_habits + total_tasks) * 100, 1) if (total_habits + total_tasks) > 0 else 0,
            daily_breakdown=daily_breakdown
        )

    async def get_overall_progress(self) -> Dict[str, Any]:
        """Get overall progress statistics."""
        habits = await self.list_habits()
        completions = await self.list_completions(
            date.today().replace(day=1),
            date.today()
        )

        total_possible = len(habits) * len(completions) if completions else 0
        total_completed = sum(
            sum(1 for h in habits if c.habit_completions.get(h.id, 0) >= h.target_count)
            for c in completions
        )

        return {
            "total_habits": len(habits),
            "days_tracked": len(completions),
            "total_possible_completions": total_possible,
            "total_completed": total_completed,
            "overall_rate": round(total_completed / total_possible * 100, 1) if total_possible > 0 else 0
        }


def get_database() -> Database:
    """Create database instance from environment variables."""
    # mcp-server/.env, independent of the client's working directory or envFile support
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    user_id = os.getenv("SUPABASE_USER_ID")

    if not all([url, key, user_id]):
        raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_KEY, SUPABASE_USER_ID")

    return Database(url, key, user_id)