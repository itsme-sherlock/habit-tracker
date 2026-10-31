export function getNotificationIcon(category: string): string {
  switch (category) {
    case 'study':
      return '📚';
    case 'practice':
      return '💻';
    case 'review':
      return '🔁';
    case 'mock-exam':
      return '🧪';
    default:
      return '📝';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'study':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'practice':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'review':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'mock-exam':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getProgressColor(percent: number): string {
  if (percent === 100) return 'text-green-500';
  if (percent >= 75) return 'text-blue-500';
  if (percent >= 50) return 'text-yellow-500';
  if (percent >= 25) return 'text-orange-500';
  return 'text-red-500';
}