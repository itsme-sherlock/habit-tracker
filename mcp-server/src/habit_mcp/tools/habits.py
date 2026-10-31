"""MCP tools for habit management."""
from __future__ import annotations
from typing import Optional, List
from fastmcp import FastMCP
from ..database import get_database
from ..models import HabitCreate, HabitUpdate


def register_habit_tools(mcp: FastMCP):
    """Register all habit-related tools with the MCP server."""
    db = get_database()

    @mcp.tool()
    async def list_habits() -> str:
        """List all habits with their current progress for today."""
        habits = await db.list_habits()
        if not habits:
            return "No habits found. Create your first habit with `create_habit`!"

        today_completion = await db.get_today_completion()
        lines = ["## Your Habits\n"]
        for habit in habits:
            completed_today = 0
            if today_completion:
                completed_today = today_completion.habit_completions.get(habit.id, 0)

            status = "✅" if completed_today >= habit.target_count else "⏳"
            progress = f"{completed_today}/{habit.target_count} {habit.unit}"
            lines.append(f"{status} **{habit.name}** — {progress}")
            if habit.description:
                lines.append(f"   *{habit.description}*")

        return "\n".join(lines)

    @mcp.tool()
    async def create_habit(
        name: str,
        target_count: int = 1,
        unit: str = "times",
        description: Optional[str] = None
    ) -> str:
        """Create a new daily habit.

        Args:
            name: Name of the habit (e.g., "Study GCP", "Drink water")
            target_count: How many times to complete daily (default: 1)
            unit: Unit of measurement - "times", "hours", or "minutes" (default: "times")
            description: Optional description/notes for the habit
        """
        if unit not in ("times", "hours", "minutes"):
            return "Error: unit must be 'times', 'hours', or 'minutes'"

        habit = HabitCreate(
            name=name,
            target_count=target_count,
            unit=unit,
            description=description
        )
        created = await db.create_habit(habit)
        return f"✅ Created habit: **{created.name}** ({created.target_count} {created.unit}/day)"

    @mcp.tool()
    async def update_habit(
        habit_id: str,
        name: Optional[str] = None,
        target_count: Optional[int] = None,
        unit: Optional[str] = None,
        description: Optional[str] = None
    ) -> str:
        """Update an existing habit.

        Args:
            habit_id: ID of the habit to update
            name: New name (optional)
            target_count: New target count (optional)
            unit: New unit - "times", "hours", or "minutes" (optional)
            description: New description (optional)
        """
        if unit and unit not in ("times", "hours", "minutes"):
            return "Error: unit must be 'times', 'hours', or 'minutes'"

        update = HabitUpdate(
            name=name,
            target_count=target_count,
            unit=unit,
            description=description
        )
        habit = await db.update_habit(habit_id, update)
        if not habit:
            return f"❌ Habit with ID {habit_id} not found"

        return f"✅ Updated habit: **{habit.name}**"

    @mcp.tool()
    async def delete_habit(habit_id: str) -> str:
        """Delete a habit permanently.

        Args:
            habit_id: ID of the habit to delete
        """
        success = await db.delete_habit(habit_id)
        if not success:
            return f"❌ Habit with ID {habit_id} not found"
        return "✅ Habit deleted"

    @mcp.tool()
    async def reorder_habits(habit_ids: List[str]) -> str:
        """Reorder habits by providing a list of habit IDs in the desired order.

        Args:
            habit_ids: List of habit IDs in the new order
        """
        habits = await db.reorder_habits(habit_ids)
        if not habits:
            return "❌ No habits found or invalid IDs"
        return "✅ Habits reordered"

    @mcp.tool()
    async def increment_habit(habit_id: str) -> str:
        """Increment today's completion count for a habit.

        Args:
            habit_id: ID of the habit to increment
        """
        result = await db.increment_habit_today(habit_id)
        habit = await db.get_habit(habit_id)
        if not habit:
            return f"❌ Habit with ID {habit_id} not found"

        count = result.get(habit_id, 0)
        status = "✅" if count >= habit.target_count else "📈"
        return f"{status} **{habit.name}**: {count}/{habit.target_count} {habit.unit} today"

    @mcp.tool()
    async def decrement_habit(habit_id: str) -> str:
        """Decrement today's completion count for a habit.

        Args:
            habit_id: ID of the habit to decrement
        """
        result = await db.decrement_habit_today(habit_id)
        habit = await db.get_habit(habit_id)
        if not habit:
            return f"❌ Habit with ID {habit_id} not found"

        count = result.get(habit_id, 0)
        return f"📉 **{habit.name}**: {count}/{habit.target_count} {habit.unit} today"