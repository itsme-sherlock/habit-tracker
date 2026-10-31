import { useState } from 'react';
import { Plus, Trash2, Pencil, MoreVertical } from 'lucide-react';
import type { Habit } from '../types';
import { ChecklistItem } from './ChecklistItem';

function HabitMenu({ habit, onEdit, onDelete }: { habit: Habit; onEdit?: (h: Habit) => void; onDelete?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="icon-button"
        aria-label={`More actions for ${habit.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false); }}
      >
        <MoreVertical className="w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="menu-pop" onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false); }}>
          {onEdit && (
            <button role="menuitem" onClick={() => { setOpen(false); onEdit(habit); }}>
              <Pencil className="w-4 h-4" aria-hidden="true" /> Edit
            </button>
          )}
          {onDelete && (
            <button role="menuitem" className="danger" onClick={() => { setOpen(false); onDelete(habit.id); }}>
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="habit-list">
      {habits.map((habit) => {
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
            <ChecklistItem
              type="habit"
              habit={habit}
              completed={completed}
              onToggle={() => {}}
              onIncrement={() => onIncrement(habit.id)}
              onDecrement={() => onDecrement(habit.id)}
              menu={editable && (onEdit || onDelete) ? (
                <HabitMenu habit={habit} onEdit={onEdit} onDelete={onDelete} />
              ) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}