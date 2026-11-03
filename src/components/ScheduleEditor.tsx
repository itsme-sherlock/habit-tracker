import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, RotateCcw, Zap } from 'lucide-react';
import { format, parseISO, addDays, addWeeks, startOfWeek, endOfWeek, isSameDay, isToday, getDay } from 'date-fns';
import type { StudyTask } from '../types';
import { getNotificationIcon, getCategoryColor, formatDuration } from '../utils/notifications';

interface ScheduleEditorProps {
  tasks: Record<string, StudyTask[]>;
  onCreateTask: (task: Omit<StudyTask, 'id'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<StudyTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  getDueReviews: (date: string) => Promise<StudyTask[]>;
  onProcessReview: (reviewTask: StudyTask, rating: 0 | 1 | 2 | 3) => Promise<void>;
}

const CATEGORIES = ['study', 'practice', 'review', 'spaced-review', 'mock-exam'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  study: 'Study',
  practice: 'Practice',
  review: 'Review',
  'spaced-review': 'Spaced Review',
  'mock-exam': 'Mock Exam',
};

const RATING_LABELS = {
  0: { label: 'Again', color: 'bg-red-500', desc: 'Reset to 1 day' },
  1: { label: 'Hard', color: 'bg-orange-500', desc: '× 1.3' },
  2: { label: 'Good', color: 'bg-green-500', desc: '× 2.0' },
  3: { label: 'Easy', color: 'bg-blue-500', desc: '× 2.5' },
} as const;

export function ScheduleEditor({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  selectedDate,
  onSelectDate,
  getDueReviews,
  onProcessReview,
}: ScheduleEditorProps) {
  const [viewDate, setViewDate] = useState(selectedDate);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 60,
    category: 'study' as const,
  });
  const [dueReviews, setDueReviews] = useState<StudyTask[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Load due reviews when viewDate changes
  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const reviews = await getDueReviews(viewDate);
        setDueReviews(reviews);
      } catch (err) {
        console.error('Failed to load due reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [viewDate, getDueReviews]);

  const weekStart = startOfWeek(parseISO(viewDate), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(parseISO(viewDate), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = editingTask?.date || selectedDate;

    if (editingTask) {
      await onUpdateTask(editingTask.id, { ...formData, date });
    } else {
      await onCreateTask({ ...formData, date, completed: false });
    }
    setShowModal(false);
    setEditingTask(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      durationMinutes: 60,
      category: 'study',
    });
  };

  const handleEdit = (task: StudyTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      durationMinutes: task.durationMinutes,
      category: task.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await onDeleteTask(id);
    }
  };

  const handleToggle = async (task: StudyTask) => {
    await onToggleComplete(task.id, !task.completed);
  };

  const dayTasks = (date: string) => tasks[date] || [];

  const totalMinutesForDate = (date: string) =>
    dayTasks(date).reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(format(addWeeks(parseISO(viewDate), -1), 'yyyy-MM-dd'))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <button
          onClick={() => setViewDate(format(addWeeks(parseISO(viewDate), 1), 'yyyy-MM-dd'))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reviews Due Section */}
      {dueReviews.length > 0 && (
        <div className="card p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                Reviews Due ({dueReviews.length})
              </h3>
            </div>
            {reviewsLoading && (
              <span className="text-xs text-purple-500 animate-pulse">Loading...</span>
            )}
          </div>
          <div className="space-y-2">
            {dueReviews.map(review => (
              <div key={review.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{review.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Source: {review.sourceTaskId ? 'Linked task' : 'Unknown'} •
                      Review #{review.reviewCount} • Interval: {review.reviewInterval}d
                    </p>
                    {review.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{review.description}</p>
                    )}
                  </div>
                  <Zap className="w-5 h-5 text-purple-500 flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {([0, 1, 2, 3] as const).map(rating => {
                    const r = RATING_LABELS[rating];
                    return (
                      <button
                        key={rating}
                        onClick={async () => {
                          await onProcessReview(review, rating);
                          // Refresh reviews after processing
                          const updated = await getDueReviews(viewDate);
                          setDueReviews(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105 ${r.color}`}
                        title={r.desc}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {weekDates.map(date => (
                <th key={date} className="p-2 text-center">
                  <div className={`text-xs font-medium ${isToday(parseISO(date)) ? 'text-primary-500' : 'text-gray-500'}`}>
                    {format(parseISO(date), 'EEE')}
                  </div>
                  <div className={`text-lg font-medium ${isToday(parseISO(date)) ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30 rounded-full w-8 h-8 mx-auto flex items-center justify-center' : ''}`}>
                    {format(parseISO(date), 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDates.map(date => (
                <td key={date} className="p-1 vertical-align-top">
                  <button
                    onClick={() => onSelectDate(date)}
                    className={`w-full h-32 p-2 border rounded-lg text-left transition-colors ${
                      date === selectedDate
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {dayTasks(date).map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded bg-white dark:bg-gray-800 border text-xs ${
                            task.completed ? 'opacity-50 line-through' : ''
                          } ${getCategoryColor(task.category)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{task.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(task);
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {task.completed ? '✓' : '○'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-75">{formatDuration(task.durationMinutes)}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(task);
                                }}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(task.id);
                                }}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayTasks(date).length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(date);
                            setEditingTask(null);
                            resetForm();
                            setShowModal(true);
                          }}
                          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                          + Add task
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                      {formatDuration(totalMinutesForDate(date))}
                    </div>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          resetForm();
          setShowModal(true);
        }}
        className="btn-primary w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Task to Selected Day
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button
                onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input"
                  placeholder="e.g., BigQuery Partitioning"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input"
                  rows={2}
                  placeholder="Details, links, notes..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})}
                    className="input"
                    min="15"
                    max="480"
                    step="15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="input"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {getNotificationIcon(cat)} {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}