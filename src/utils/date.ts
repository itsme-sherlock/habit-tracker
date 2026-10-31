import { format, parseISO, startOfWeek, endOfWeek, addDays, addWeeks, isToday, isBefore, isAfter, differenceInDays } from 'date-fns';

export function formatDate(date: Date | string, pattern: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export function getMonthRange(date: Date = new Date()): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = parseISO(start);
  const endDate = parseISO(end);

  while (!isAfter(current, endDate)) {
    dates.push(formatDate(current));
    current = addDays(current, 1);
  }

  return dates;
}

export function getDayName(date: string): string {
  return format(parseISO(date), 'EEEE');
}

export function getShortDayName(date: string): string {
  return format(parseISO(date), 'EEE');
}

export function getRelativeDateLabel(date: string): string {
  const d = parseISO(date);
  if (isToday(d)) return 'Today';
  const tomorrow = addDays(new Date(), 1);
  if (formatDate(d) === formatDate(tomorrow)) return 'Tomorrow';
  const yesterday = addDays(new Date(), -1);
  if (formatDate(d) === formatDate(yesterday)) return 'Yesterday';
  const diff = differenceInDays(d, new Date());
  if (diff > 0 && diff <= 7) return getDayName(date);
  return formatDate(d, 'MMM d');
}

export function isPastDate(date: string): boolean {
  return isBefore(parseISO(date), new Date());
}

export function isFutureDate(date: string): boolean {
  return isAfter(parseISO(date), new Date());
}

export function daysUntil(date: string): number {
  return differenceInDays(parseISO(date), new Date());
}

export const GCP_PREP_START = '2026-11-01';
export const GCP_PREP_END = '2026-12-31';

export function isInGCPPrepPeriod(date: string): boolean {
  return date >= GCP_PREP_START && date <= GCP_PREP_END;
}

export function getGCPPrepDayNumber(date: string): number {
  const start = parseISO(GCP_PREP_START);
  const target = parseISO(date);
  return differenceInDays(target, start) + 1;
}

export function getWeekNumber(date: string): number {
  const start = parseISO(GCP_PREP_START);
  const target = parseISO(date);
  return Math.floor(differenceInDays(target, start) / 7) + 1;
}