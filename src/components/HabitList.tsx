import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Habit } from '../types';
import { ChecklistItem } from './ChecklistItem';

interface HabitListProps {
  habits: Habit[];
  completions: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
  onReorder?: (habitIds: string[]) => void;
  editable?: boolean;
}

export function HabitList({
  habits,
  completions,
  onIncrement,
  onDecrement,
  onEdit,
  onDelete,
  onReorder,
  editable = false,
}: HabitListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="mb-2">No habits yet</p>
        {editable && (
          <button
            onClick={() => onEdit?.({ id: '', name: '', targetCount: 1, unit: 'times', order: 0, createdAt: Date.now() })}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Your First Habit
          </button>
        )}
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!editable || !onReorder) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!editable || !onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!editable || !onReorder || !draggingId || draggingId === targetId) return;
    e.preventDefault();

    const habitIds = habits.map(h => h.id);
    const fromIndex = habitIds.indexOf(draggingId);
    const toIndex = habitIds.indexOf(targetId);

    const newOrder = [...habitIds];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    onReorder(newOrder);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  return (
    <div className="space-y-3">
      {habits.map((habit, index) => {
        const completed = completions[habit.id] || 0;
        const isDragging = draggingId === habit.id;

        return (
          <div
            key={habit.id}
            draggable={editable && !!onReorder}
            onDragStart={(e) => handleDragStart(e, habit.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, habit.id)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${isDragging ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2">
              {editable && onReorder && (
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="w-5 h-5" />
                </button>
              )}
              <ChecklistItem
                type="habit"
                habit={habit}
                completed={completed}
                onIncrement={() => onIncrement(habit.id)}
                onDecrement={() => onDecrement(habit.id)}
              />
              {editable && (
                <div className="flex items-center gap-1 ml-auto">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(habit)}
                      className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                      aria-label="Edit habit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(habit.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}