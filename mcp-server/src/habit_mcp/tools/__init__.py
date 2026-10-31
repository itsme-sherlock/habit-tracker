"""MCP tools package - exports all tool registration functions."""
from .habits import register_habit_tools
from .tasks import register_task_tools
from .completions import register_completion_tools
from .stats import register_stats_tools

__all__ = [
    "register_habit_tools",
    "register_task_tools",
    "register_completion_tools",
    "register_stats_tools",
]