"""MCP tools for daily completion management."""
from __future__ import annotations
from datetime import date
from typing import Optional, List, Dict
from fastmcp import FastMCP
from ..database import get_database
from ..models import DailyCompletionCreate


def register_completion_tools(mcp: FastMCP):
    """Register all completion-related tools with the MCP server."""
    db = get_database()

    @mcp.tool()
    async def get_today_completion() -> str:
        """Get today's completion record."""
        completion = await db.get_today_completion()
        if not completion:
            return "📝 No completion record for today yet."

        habits = await db.list_habits()
        tasks = await db.list_tasks()

        lines = [f"## Today's Completion — {completion.date.isoformat()}\n"]

        # Habits
        if habits:
            lines.append("### Habits")
            for habit in habits:
                count = completion.habit_completions.get(habit.id, 0)
                status = "✅" if count >= habit.target_count else "⏳"
                lines.append(f"  {status} **{habit.name}**: {count}/{habit.target_count} {habit.unit}")

        # Tasks
        if tasks:
            lines.append("\n### Study Tasks")
            for task in tasks:
                completed = task.completed or task.id in completion.task_completions
                status = "✅" if completed else "⏳"
                cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
                lines.append(f"  {status} {cat_emoji} **{task.title}** — {task.duration_minutes}min")

        if completion.notes:
            lines.append(f"\n📝 **Notes**: {completion.notes}")
        if completion.mood:
            mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}.get(completion.mood, "😐")
            lines.append(f"{mood_emoji} **Mood**: {completion.mood}/5")

        return "\n".join(lines)

    @mcp.tool()
    async def get_completion(target_date: str) -> str:
        """Get completion record for a specific date.

        Args:
            target_date: Date in YYYY-MM-DD format
        """
        completion = await db.get_completion(target_date)
        if not completion:
            return f"📝 No completion record for {target_date}."

        habits = await db.list_habits()
        tasks = await db.list_tasks(date.fromisoformat(target_date))

        lines = [f"## Completion — {target_date}\n"]

        if habits:
            lines.append("### Habits")
            for habit in habits:
                count = completion.habit_completions.get(habit.id, 0)
                status = "✅" if count >= habit.target_count else "⏳"
                lines.append(f"  {status} **{habit.name}**: {count}/{habit.target_count} {habit.unit}")

        if tasks:
            lines.append("\n### Study Tasks")
            for task in tasks:
                completed = task.completed or task.id in completion.task_completions
                status = "✅" if completed else "⏳"
                cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
                lines.append(f"  {status} {cat_emoji} **{task.title}** — {task.duration_minutes}min")

        if completion.notes:
            lines.append(f"\n📝 **Notes**: {completion.notes}")
        if completion.mood:
            mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}.get(completion.mood, "😐")
            lines.append(f"{mood_emoji} **Mood**: {completion.mood}/5")

        return "\n".join(lines)

    @mcp.tool()
    async def complete_day(
        habit_completions: Dict[str, int],
        task_completions: List[str],
        notes: Optional[str] = None,
        mood: Optional[int] = None
    ) -> str:
        """Save end-of-day completion record.

        Args:
            habit_completions: Dict of habit_id -> count completed today
            task_completions: List of task IDs completed today
            notes: Optional end-of-day reflection notes
            mood: Mood rating 1-5 (optional)
        """
        if mood and (mood < 1 or mood > 5):
            return "Error: mood must be between 1 and 5"

        completion = DailyCompletionCreate(
            date=date.today(),
            habit_completions=habit_completions,
            task_completions=task_completions,
            notes=notes,
            mood=mood
        )
        saved = await db.complete_day(completion)

        lines = [f"✅ **Day completed** — {saved.date.isoformat()}\n"]

        if habit_completions:
            habits = await db.list_habits()
            lines.append("### Habits Completed")
            for habit_id, count in habit_completions.items():
                habit = next((h for h in habits if h.id == habit_id), None)
                if habit:
                    status = "✅" if count >= habit.target_count else "📈"
                    lines.append(f"  {status} **{habit.name}**: {count}/{habit.target_count} {habit.unit}")

        if task_completions:
            tasks = await db.list_tasks()
            lines.append("\n### Tasks Completed")
            for task_id in task_completions:
                task = next((t for t in tasks if t.id == task_id), None)
                if task:
                    cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
                    lines.append(f"  ✅ {cat_emoji} **{task.title}** — {task.duration_minutes}min")

        if notes:
            lines.append(f"\n📝 **Notes**: {notes}")
        if mood:
            mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}[mood]
            lines.append(f"{mood_emoji} **Mood**: {mood}/5")

        return "\n".join(lines)

    @mcp.tool()
    async def list_completions(start_date: str, end_date: str) -> str:
        """List completions for a date range.

        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
        """
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
        completions = await db.list_completions(start, end)

        if not completions:
            return f"📝 No completions from {start_date} to {end_date}."

        habits = await db.list_habits()

        lines = [f"## Completion History — {start_date} to {end_date}\n"]

        for comp in completions:
            habit_done = sum(1 for h in habits if comp.habit_completions.get(h.id, 0) >= h.target_count)
            task_done = len(comp.task_completions)

            mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}.get(comp.mood, "") if comp.mood else ""
            lines.append(f"### {comp.date.isoformat()} — {habit_done}/{len(habits)} habits, {task_done} tasks {mood_emoji}")

            if comp.notes:
                lines.append(f"  *{comp.notes}*")

        return "\n".join(lines)

    @mcp.tool()
    async def update_today_mood(mood: int) -> str:
        """Update today's mood rating.

        Args:
            mood: Mood rating 1-5
        """
        if mood < 1 or mood > 5:
            return "Error: mood must be between 1 and 5"

        completion = await db.get_today_completion()
        current_notes = completion.notes if completion else None
        current_habits = completion.habit_completions if completion else {}
        current_tasks = completion.task_completions if completion else []

        saved = await db.complete_day(DailyCompletionCreate(
            date=date.today(),
            habit_completions=current_habits,
            task_completions=current_tasks,
            notes=current_notes,
            mood=mood
        ))

        mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}[mood]
        return f"{mood_emoji} Mood updated to {mood}/5"

    @mcp.tool()
    async def add_today_notes(notes: str) -> str:
        """Add or update today's reflection notes.

        Args:
            notes: End-of-day reflection notes
        """
        completion = await db.get_today_completion()
        current_habits = completion.habit_completions if completion else {}
        current_tasks = completion.task_completions if completion else []
        current_mood = completion.mood if completion else None

        saved = await db.complete_day(DailyCompletionCreate(
            date=date.today(),
            habit_completions=current_habits,
            task_completions=current_tasks,
            notes=notes,
            mood=current_mood
        ))

        return f"📝 Notes saved for {saved.date.isoformat()}"