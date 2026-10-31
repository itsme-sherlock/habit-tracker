"""MCP tools for statistics and streaks."""
from __future__ import annotations
from datetime import date, timedelta
from typing import Optional
from fastmcp import FastMCP
from ..database import get_database


def register_stats_tools(mcp: FastMCP):
    """Register all stats-related tools with the MCP server."""
    db = get_database()

    @mcp.tool()
    async def get_streaks() -> str:
        """Get current streaks for all habits."""
        streaks = await db.get_streaks()

        if not streaks:
            return "No habits found. Create habits first!"

        lines = ["## Habit Streaks\n"]
        for streak in streaks:
            if streak.current_streak > 0:
                fire = "🔥" * min(streak.current_streak, 5)
                lines.append(f"{fire} **{streak.habit_name}**: {streak.current_streak} days (best: {streak.longest_streak})")
            else:
                lines.append(f"❄️ **{streak.habit_name}**: 0 days (best: {streak.longest_streak})")

        return "\n".join(lines)

    @mcp.tool()
    async def get_weekly_stats(week_start: Optional[str] = None) -> str:
        """Get weekly statistics.

        Args:
            week_start: Monday start date in YYYY-MM-DD format (default: this week)
        """
        if week_start:
            start = date.fromisoformat(week_start)
        else:
            # Default to Monday of current week
            today = date.today()
            start = today - timedelta(days=today.weekday())

        stats = await db.get_weekly_stats(start)

        lines = [
            f"## Weekly Stats — {stats.week_start.isoformat()} to {stats.week_end.isoformat()}\n",
            f"📊 **Completion Rate**: {stats.completion_rate}%",
            f"✅ **Habits**: {stats.completed_habits}/{stats.total_habits}",
            f"📝 **Tasks**: {stats.completed_tasks}/{stats.total_tasks}",
            f"⏱️ **Study Time**: {stats.total_study_hours} hours\n",
            "### Daily Breakdown"
        ]

        for day, data in stats.daily_breakdown.items():
            mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}.get(data.get("mood"), "") if data.get("mood") else ""
            lines.append(
                f"  **{day}**: {data['habits_completed']} habits, "
                f"{data['tasks_completed']} tasks, "
                f"{data['study_minutes']}min study {mood_emoji}"
            )

        return "\n".join(lines)

    @mcp.tool()
    async def get_overall_progress() -> str:
        """Get overall progress statistics since tracking began."""
        progress = await db.get_overall_progress()

        lines = [
            "## Overall Progress\n",
            f"📋 **Total Habits**: {progress['total_habits']}",
            f"📅 **Days Tracked**: {progress['days_tracked']}",
            f"✅ **Total Completions**: {progress['total_completed']}/{progress['total_possible_completions']}",
            f"📈 **Overall Rate**: {progress['overall_rate']}%"
        ]

        if progress['total_habits'] > 0 and progress['days_tracked'] > 0:
            avg_per_day = progress['total_completed'] / progress['days_tracked']
            lines.append(f"📊 **Avg Completions/Day**: {avg_per_day:.1f}")

        return "\n".join(lines)

    @mcp.tool()
    async def get_today_plan() -> str:
        """Get full plan for today: habits + tasks + completion status."""
        plan = await db.get_today_plan()

        lines = [f"## Today's Plan — {plan.date.isoformat()}\n"]

        # Habits
        if plan.habits:
            lines.append("### Daily Habits")
            for habit in plan.habits:
                completed = 0
                if plan.completion:
                    completed = plan.completion.habit_completions.get(habit.id, 0)
                status = "✅" if completed >= habit.target_count else "⏳"
                progress = f"{completed}/{habit.target_count} {habit.unit}"
                lines.append(f"  {status} **{habit.name}** — {progress}")
                if habit.description:
                    lines.append(f"    *{habit.description}*")

        # Tasks
        if plan.tasks:
            lines.append("\n### Study Tasks")
            for task in plan.tasks:
                completed = task.completed
                if plan.completion and task.id in plan.completion.task_completions:
                    completed = True
                status = "✅" if completed else "⏳"
                cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
                lines.append(f"  {status} {cat_emoji} **{task.title}** — {task.duration_minutes}min")
                if task.description:
                    lines.append(f"    *{task.description}*")

        # Summary
        lines.append(f"\n### Summary")
        lines.append(f"  Habits: {plan.completed_habits}/{plan.total_habits}")
        lines.append(f"  Tasks: {plan.completed_tasks}/{plan.total_tasks}")

        if plan.completion:
            if plan.completion.mood:
                mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}[plan.completion.mood]
                lines.append(f"  Mood: {mood_emoji} {plan.completion.mood}/5")
            if plan.completion.notes:
                lines.append(f"  Notes: {plan.completion.notes}")

        return "\n".join(lines)

    @mcp.tool()
    async def get_week_plan(week_start: Optional[str] = None) -> str:
        """Get plan for a week.

        Args:
            week_start: Monday start date in YYYY-MM-DD format (default: this week)
        """
        if week_start:
            start = date.fromisoformat(week_start)
        else:
            today = date.today()
            start = today - timedelta(days=today.weekday())

        plans = await db.get_week_plan(start)

        lines = [f"## Week Plan — {start.isoformat()} to {(start + timedelta(days=6)).isoformat()}\n"]

        for plan in plans:
            day_name = plan.date.strftime("%A")
            lines.append(f"### {day_name} ({plan.date.isoformat()})")

            if plan.habits:
                completed = plan.completed_habits
                lines.append(f"  📋 Habits: {completed}/{plan.total_habits}")

            if plan.tasks:
                completed = plan.completed_tasks
                total_min = sum(t.duration_minutes for t in plan.tasks)
                done_min = sum(t.duration_minutes for t in plan.tasks
                               if t.completed or (plan.completion and t.id in plan.completion.task_completions))
                lines.append(f"  📝 Tasks: {completed}/{plan.total_tasks} ({done_min}/{total_min}min)")

            if plan.completion and plan.completion.mood:
                mood_emoji = {1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"}[plan.completion.mood]
                lines.append(f"  Mood: {mood_emoji} {plan.completion.mood}/5")

            lines.append("")

        return "\n".join(lines)