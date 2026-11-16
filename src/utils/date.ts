import { PLAN_START, PLAN_END } from '../data/gcpCurriculum';

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates day number relative to 2026-11-01 (Day 1)
 * Uses noon (12:00:00) to avoid timezone/DST shifting
 */
export function getDayNumber(dateStr: string): number {
  try {
    const parts = dateStr.split('-');
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    const start = new Date(2026, 10, 1, 12, 0, 0); // Month 10 is November in JS (0-indexed)
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  } catch (e) {
    return 1;
  }
}

/**
 * Format date string into human friendly label: "Sun, Nov 16"
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Get next date YYYY-MM-DD (strictly +1 day, timezone safe)
 */
export function getNextDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d + 1, 12, 0, 0);
    const nextY = dt.getFullYear();
    const nextM = String(dt.getMonth() + 1).padStart(2, '0');
    const nextD = String(dt.getDate()).padStart(2, '0');
    return `${nextY}-${nextM}-${nextD}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Get previous date YYYY-MM-DD (strictly -1 day, timezone safe)
 */
export function getPrevDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d - 1, 12, 0, 0);
    const prevY = dt.getFullYear();
    const prevM = String(dt.getMonth() + 1).padStart(2, '0');
    const prevD = String(dt.getDate()).padStart(2, '0');
    return `${prevY}-${prevM}-${prevD}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format duration minutes into "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
