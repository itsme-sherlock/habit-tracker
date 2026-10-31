"""MCP tools for study task management."""
from __future__ import annotations
from datetime import date, timedelta
from typing import Optional, List
from fastmcp import FastMCP
from ..database import get_database
from ..models import StudyTaskCreate, StudyTaskUpdate, Category


def register_task_tools(mcp: FastMCP):
    """Register all task-related tools with the MCP server."""
    db = get_database()

    @mcp.tool()
    async def list_tasks(target_date: Optional[str] = None) -> str:
        """List study tasks for a specific date (default: today).

        Args:
            target_date: Date in YYYY-MM-DD format (optional, defaults to today)
        """
        target = date.fromisoformat(target_date) if target_date else date.today()
        tasks = await db.list_tasks(target)

        if not tasks:
            return f"📅 No tasks scheduled for {target.isoformat()}"

        lines = [f"## Study Tasks — {target.isoformat()}\n"]
        for task in tasks:
            status = "✅" if task.completed else "⏳"
            cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
            lines.append(f"{status} {cat_emoji} **{task.title}** — {task.duration_minutes}min ({task.category.value})")
            if task.description:
                lines.append(f"   *{task.description}*")

        total_min = sum(t.duration_minutes for t in tasks)
        completed_min = sum(t.duration_minutes for t in tasks if t.completed)
        lines.append(f"\n📊 **Progress**: {completed_min}/{total_min}min ({len([t for t in tasks if t.completed])}/{len(tasks)} tasks)")

        return "\n".join(lines)

    @mcp.tool()
    async def list_tasks_range(start_date: str, end_date: str) -> str:
        """List study tasks for a date range.

        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
        """
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
        tasks = await db.list_tasks_range(start, end)

        if not tasks:
            return f"📅 No tasks scheduled from {start.isoformat()} to {end.isoformat()}"

        # Group by date
        by_date: dict[date, list] = {}
        for task in tasks:
            by_date.setdefault(task.date, []).append(task)

        lines = [f"## Study Schedule — {start.isoformat()} to {end.isoformat()}\n"]
        for d in sorted(by_date.keys()):
            day_tasks = by_date[d]
            completed = [t for t in day_tasks if t.completed]
            total_min = sum(t.duration_minutes for t in day_tasks)
            done_min = sum(t.duration_minutes for t in completed)
            lines.append(f"\n### {d.isoformat()} ({len(completed)}/{len(day_tasks)} tasks, {done_min}/{total_min}min)")
            for task in day_tasks:
                status = "✅" if task.completed else "⏳"
                cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}.get(task.category.value, "📝")
                lines.append(f"  {status} {cat_emoji} {task.title} — {task.duration_minutes}min")

        return "\n".join(lines)

    @mcp.tool()
    async def create_task(
        target_date: str,
        title: str,
        duration_minutes: int,
        category: str,
        description: Optional[str] = None
    ) -> str:
        """Create a new study task.

        Args:
            target_date: Date in YYYY-MM-DD format
            title: Task title (e.g., "BigQuery Partitioning")
            duration_minutes: Duration in minutes (5-480)
            category: Category - "study", "practice", "review", or "mock-exam"
            description: Optional description/notes
        """
        try:
            cat = Category(category)
        except ValueError:
            return f"Error: category must be one of: study, practice, review, mock-exam"

        target = date.fromisoformat(target_date)
        task = StudyTaskCreate(
            date=target,
            title=title,
            duration_minutes=duration_minutes,
            category=cat,
            description=description
        )
        created = await db.create_task(task)
        cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}[cat.value]
        return f"✅ Created task: {cat_emoji} **{created.title}** on {created.date.isoformat()} ({created.duration_minutes}min)"

    @mcp.tool()
    async def bulk_create_tasks(tasks: List[dict]) -> str:
        """Create multiple study tasks at once (useful for templates).

        Args:
            tasks: List of task objects with keys: date (YYYY-MM-DD), title, duration_minutes, category, description (optional)
        """
        task_objects = []
        for t in tasks:
            try:
                cat = Category(t["category"])
                task_objects.append(StudyTaskCreate(
                    date=date.fromisoformat(t["date"]),
                    title=t["title"],
                    duration_minutes=t["duration_minutes"],
                    category=cat,
                    description=t.get("description")
                ))
            except (KeyError, ValueError) as e:
                return f"Error in task data: {e}"

        created = await db.bulk_create_tasks(task_objects)
        return f"✅ Created {len(created)} tasks"

    @mcp.tool()
    async def update_task(
        task_id: str,
        title: Optional[str] = None,
        duration_minutes: Optional[int] = None,
        category: Optional[str] = None,
        description: Optional[str] = None,
        completed: Optional[bool] = None
    ) -> str:
        """Update a study task.

        Args:
            task_id: ID of the task to update
            title: New title (optional)
            duration_minutes: New duration (optional)
            category: New category - "study", "practice", "review", "mock-exam" (optional)
            description: New description (optional)
            completed: Toggle completion status (optional)
        """
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if duration_minutes is not None:
            update_data["duration_minutes"] = duration_minutes
        if category is not None:
            try:
                update_data["category"] = Category(category)
            except ValueError:
                return "Error: category must be one of: study, practice, review, mock-exam"
        if description is not None:
            update_data["description"] = description
        if completed is not None:
            update_data["completed"] = completed

        if not update_data:
            return "Error: No fields to update"

        update = StudyTaskUpdate(**update_data)
        task = await db.update_task(task_id, update)
        if not task:
            return f"❌ Task with ID {task_id} not found"

        cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}[task.category.value]
        status = "✅" if task.completed else "⏳"
        return f"{status} Updated: {cat_emoji} **{task.title}**"

    @mcp.tool()
    async def delete_task(task_id: str) -> str:
        """Delete a study task.

        Args:
            task_id: ID of the task to delete
        """
        success = await db.delete_task(task_id)
        if not success:
            return f"❌ Task with ID {task_id} not found"
        return "✅ Task deleted"

    @mcp.tool()
    async def toggle_task(task_id: str, completed: bool) -> str:
        """Toggle task completion status.

        Args:
            task_id: ID of the task
            completed: True to mark complete, False to mark incomplete
        """
        task = await db.toggle_task(task_id, completed)
        if not task:
            return f"❌ Task with ID {task_id} not found"

        cat_emoji = {"study": "📚", "practice": "💻", "review": "🔁", "mock-exam": "🧪"}[task.category.value]
        status = "✅" if task.completed else "⏳"
        return f"{status} {cat_emoji} **{task.title}** marked as {'complete' if task.completed else 'incomplete'}"

    @mcp.tool()
    async def create_weekly_template(
        start_date: str,
        template_name: str = "GCP Prep"
    ) -> str:
        """Create a weekly study template based on the GCP Data Engineer curriculum.

        Args:
            start_date: Monday start date in YYYY-MM-DD format
            template_name: Name for the template (default: "GCP Prep")
        """
        start = date.fromisoformat(start_date)
        # GCP weekly pattern: study Mon/Wed/Fri, practice Tue/Thu, review Sat, mock Sun
        pattern = [
            (0, "study", 120, "GCP Fundamentals / BigQuery"),      # Monday
            (1, "practice", 90, "Hands-on Lab"),                   # Tuesday
            (2, "study", 120, "BigQuery / Dataflow"),              # Wednesday
            (3, "practice", 90, "Dataflow / PubSub Lab"),          # Thursday
            (4, "study", 120, "Composer / Cloud Functions"),       # Friday
            (5, "review", 60, "Weekly Review & Flashcards"),       # Saturday
            (6, "mock-exam", 90, "Practice Questions"),            # Sunday
        ]

        tasks = []
        for offset, cat, duration, topic in pattern:
            task_date = start + timedelta(days=offset)
            tasks.append({
                "date": task_date.isoformat(),
                "title": f"{topic} ({template_name})",
                "duration_minutes": duration,
                "category": cat,
                "description": f"Auto-generated from {template_name} template"
            })

        return await bulk_create_tasks(tasks)