import { useCallback } from 'react';
import { format, parseISO, addDays, isBefore } from 'date-fns';
import { addStudyTask, updateStudyTask, getTasksForDateRange, type StudyTask } from '../services/db';
import { manualSync } from '../services/sync';

// SM-2 Algorithm intervals (in days)
const INITIAL_INTERVALS = [1, 3, 7, 14, 30, 90]; // 1d, 3d, 7d, 14d, 30d, 90d
const MAX_INTERVAL = 90;

/**
 * Calculate next interval based on SM-2 algorithm
 * rating: 0=Again, 1=Hard, 2=Good, 3=Easy
 */
function calculateNextInterval(
  currentInterval: number,
  reviewCount: number,
  easeFactor: number,
  rating: 0 | 1 | 2 | 3
): number {
  if (rating === 0) {
    // Again - reset to first interval
    return INITIAL_INTERVALS[0];
  }

  // SM-2 formula: newInterval = currentInterval * easeFactor
  // But we use predefined intervals for the first few reviews
  if (reviewCount < INITIAL_INTERVALS.length) {
    const baseInterval = INITIAL_INTERVALS[reviewCount];

    // Apply ease factor modifiers
    let multiplier = 1;
    switch (rating) {
      case 1: multiplier = 1.3; break; // Hard
      case 2: multiplier = 2.0; break; // Good
      case 3: multiplier = 2.5; break; // Easy
    }

    return Math.min(Math.round(baseInterval * multiplier), MAX_INTERVAL);
  }

  // For later reviews, use SM-2 formula
  let newInterval = Math.round(currentInterval * easeFactor);

  // Apply rating modifier
  switch (rating) {
    case 1: newInterval = Math.round(newInterval * 1.3); break;
    case 2: newInterval = Math.round(newInterval * 1.0); break; // Good = no change
    case 3: newInterval = Math.round(newInterval * 1.3); break;
  }

  return Math.min(newInterval, MAX_INTERVAL);
}

/**
 * Calculate new ease factor based on rating
 */
function calculateEaseFactor(easeFactor: number, rating: 0 | 1 | 2 | 3): number {
  // SM-2: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  // where q is rating (0-5, we use 0-3 mapped)
  // Simplified for our 0-3 scale:
  const q = rating + 2; // Map 0-3 to 2-5
  const newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(1.3, Math.min(3.0, newEF)); // Clamp between 1.3 and 3.0
}

export function useSpacedRepetition() {
  /**
   * Schedule a review task when a study/practice task is completed
   */
  const scheduleReview = useCallback(async (sourceTask: StudyTask, rating: 0 | 1 | 2 | 3 = 2) => {
    // Only schedule reviews for study and practice tasks
    if (sourceTask.category !== 'study' && sourceTask.category !== 'practice') {
      return;
    }

    // Check if a spaced review already exists for this source task
    const existingReviews = await getTasksForDateRange('2026-11-01', '2027-12-31');
    const existing = existingReviews.find(
      t => t.isSpacedReview && t.sourceTaskId === sourceTask.id && !t.completed
    );

    const nextInterval = existing ? existing.reviewInterval || 1 : INITIAL_INTERVALS[0];
    const reviewCount = existing ? (existing.reviewCount || 0) + 1 : 1;
    const easeFactor = existing?.easeFactor || 2.5;

    // Calculate next review date
    const nextReviewDate = format(addDays(new Date(), nextInterval), 'yyyy-MM-DD');

    const reviewTask: Omit<StudyTask, 'id'> = {
      date: nextReviewDate,
      title: `Review: ${sourceTask.title}`,
      description: sourceTask.description,
      durationMinutes: Math.min(30, Math.round(sourceTask.durationMinutes * 0.3)), // Shorter review session
      category: 'spaced-review',
      completed: false,
      nextReviewDate,
      reviewInterval: nextInterval,
      reviewCount,
      sourceTaskId: sourceTask.id,
      easeFactor,
      isSpacedReview: true,
      lastReviewRating: undefined,
    };

    if (existing) {
      // Update existing review task
      await updateStudyTask(existing.id, {
        date: nextReviewDate,
        nextReviewDate,
        reviewInterval: nextInterval,
        reviewCount,
        easeFactor,
        completed: false,
        completedAt: undefined,
      });
    } else {
      // Create new review task
      await addStudyTask(reviewTask);
    }

    // Trigger sync
    void manualSync();
  }, []);

  /**
   * Get all spaced reviews due on or before a given date
   */
  const getDueReviews = useCallback(async (date: string): Promise<StudyTask[]> => {
    const allTasks = await getTasksForDateRange('2026-11-01', '2027-12-31');
    const targetDate = parseISO(date);

    return allTasks.filter(task =>
      task.isSpacedReview &&
      !task.completed &&
      task.nextReviewDate &&
      isBefore(parseISO(task.nextReviewDate), targetDate) ||
      task.nextReviewDate === date
    );
  }, []);

  /**
   * Process a review completion and schedule the next review
   */
  const processReviewCompletion = useCallback(async (
    reviewTask: StudyTask,
    rating: 0 | 1 | 2 | 3
  ) => {
    if (!reviewTask.isSpacedReview) return;

    const currentInterval = reviewTask.reviewInterval || 1;
    const reviewCount = reviewTask.reviewCount || 1;
    const easeFactor = reviewTask.easeFactor || 2.5;

    // Calculate next interval and ease factor
    const nextInterval = calculateNextInterval(currentInterval, reviewCount, easeFactor, rating);
    const newEaseFactor = calculateEaseFactor(easeFactor, rating);
    const nextReviewCount = reviewCount + 1;
    const nextReviewDate = format(addDays(new Date(), nextInterval), 'yyyy-MM-DD');

    // Update the review task with next review info
    await updateStudyTask(reviewTask.id, {
      completed: true,
      completedAt: Date.now(),
      nextReviewDate,
      reviewInterval: nextInterval,
      reviewCount: nextReviewCount,
      easeFactor: newEaseFactor,
      lastReviewRating: rating,
    });

    // Create the next review task (as a new task for the future date)
    const sourceTaskId = reviewTask.sourceTaskId;
    if (sourceTaskId) {
      // Find the original source task to get title
      const allTasks = await getTasksForDateRange('2026-11-01', '2027-12-31');
      const sourceTask = allTasks.find(t => t.id === sourceTaskId);

      if (sourceTask) {
        const nextReviewTask: Omit<StudyTask, 'id'> = {
          date: nextReviewDate,
          title: `Review: ${sourceTask.title}`,
          description: sourceTask.description,
          durationMinutes: Math.min(30, Math.round(sourceTask.durationMinutes * 0.3)),
          category: 'spaced-review',
          completed: false,
          nextReviewDate,
          reviewInterval: nextInterval,
          reviewCount: nextReviewCount,
          sourceTaskId,
          easeFactor: newEaseFactor,
          isSpacedReview: true,
          lastReviewRating: undefined,
        };

        await addStudyTask(nextReviewTask);
      }
    }

    // Trigger sync
    void manualSync();
  }, []);

  /**
   * Get all spaced reviews (for debugging/admin)
   */
  const getAllSpacedReviews = useCallback(async (): Promise<StudyTask[]> => {
    const allTasks = await getTasksForDateRange('2026-11-01', '2027-12-31');
    return allTasks.filter(t => t.isSpacedReview);
  }, []);

  return {
    scheduleReview,
    getDueReviews,
    processReviewCompletion,
    getAllSpacedReviews,
  };
}