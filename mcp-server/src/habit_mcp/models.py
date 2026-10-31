"""Pydantic models for Habit Tracker - mirror TypeScript types from PWA."""
from __future__ import annotations
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class Category(str, Enum):
    STUDY = "study"
    PRACTICE = "practice"
    REVIEW = "review"
    MOCK_EXAM = "mock-exam"


class Habit(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    frequency: str = "daily"
    target_count: int
    unit: str
    created_at: datetime
    order: int = 0
    updated_at: Optional[datetime] = None


class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    target_count: int = Field(default=1, ge=1)
    unit: str = Field(default="times", pattern="^(times|hours|minutes)$")


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    target_count: Optional[int] = Field(None, ge=1)
    unit: Optional[str] = Field(None, pattern="^(times|hours|minutes)$")


class StudyTask(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date: date
    title: str
    description: Optional[str] = None
    duration_minutes: int
    category: Category
    completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class StudyTaskCreate(BaseModel):
    date: date
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    duration_minutes: int = Field(..., ge=5, le=480)
    category: Category


class StudyTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=5, le=480)
    category: Optional[Category] = None
    completed: Optional[bool] = None


class DailyCompletion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    habit_completions: Dict[str, int] = Field(default_factory=dict)
    task_completions: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    completed_at: datetime
    mood: Optional[int] = Field(None, ge=1, le=5)


class DailyCompletionCreate(BaseModel):
    date: date
    habit_completions: Dict[str, int] = Field(default_factory=dict)
    task_completions: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    mood: Optional[int] = Field(None, ge=1, le=5)


class TodayPlan(BaseModel):
    """Combined response for today's plan."""
    date: date
    habits: List[Habit]
    tasks: List[StudyTask]
    completion: Optional[DailyCompletion] = None

    @property
    def total_habits(self) -> int:
        return len(self.habits)

    @property
    def completed_habits(self) -> int:
        if not self.completion:
            return 0
        return sum(1 for h in self.habits
                   if self.completion.habit_completions.get(h.id, 0) >= h.target_count)

    @property
    def total_tasks(self) -> int:
        return len(self.tasks)

    @property
    def completed_tasks(self) -> int:
        if not self.completion:
            return sum(1 for t in self.tasks if t.completed)
        return sum(1 for t in self.tasks
                   if t.completed or t.id in self.completion.task_completions)


class StreakInfo(BaseModel):
    habit_id: str
    habit_name: str
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date] = None


class WeeklyStats(BaseModel):
    week_start: date
    week_end: date
    total_habits: int
    total_tasks: int
    completed_habits: int
    completed_tasks: int
    total_study_hours: float
    completion_rate: float
    daily_breakdown: Dict[str, Dict[str, Any]]