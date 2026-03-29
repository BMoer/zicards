/**
 * Spaced Repetition interval calculator.
 *
 * Based on correct_streak, calculates next review time.
 * Intervals grow exponentially:
 *   streak 0 → 4 hours
 *   streak 1 → 1 day
 *   streak 2 → 3 days
 *   streak 3 → 7 days
 *   streak 4 → 14 days
 *   streak 5 → 30 days
 *   streak 6+ → 30 days (cap)
 *
 * Wrong answers reset to 4 hours.
 * Half-correct keeps current interval.
 */

const INTERVALS_MS = [
  4 * 60 * 60 * 1000,       // 0: 4 hours
  24 * 60 * 60 * 1000,      // 1: 1 day
  3 * 24 * 60 * 60 * 1000,  // 2: 3 days
  7 * 24 * 60 * 60 * 1000,  // 3: 7 days
  14 * 24 * 60 * 60 * 1000, // 4: 14 days
  30 * 24 * 60 * 60 * 1000, // 5: 30 days
]

/**
 * Calculate the next review date based on correct streak.
 * @param {number} correctStreak - current correct_streak after update
 * @returns {string} ISO timestamp for next review
 */
export function calculateNextReview(correctStreak) {
  const idx = Math.min(correctStreak, INTERVALS_MS.length - 1)
  const interval = INTERVALS_MS[idx]
  return new Date(Date.now() + interval).toISOString()
}

/**
 * Check if a card is due for review.
 * @param {string|null} nextReview - ISO timestamp or null
 * @returns {boolean}
 */
export function isDue(nextReview) {
  if (!nextReview) return true
  return new Date(nextReview) <= new Date()
}

/**
 * Count how many items are due from a progress map.
 * @param {Object} progressMap - { id: { next_review, ... } }
 * @returns {number}
 */
export function countDue(progressMap) {
  return Object.values(progressMap).filter((p) => isDue(p.next_review)).length
}

/**
 * Count items that have never been practiced (no progress entry).
 * @param {Array} items - all items (characters or sentences)
 * @param {Object} progressMap - { id: progressRecord }
 * @returns {number}
 */
export function countNew(items, progressMap) {
  return items.filter((item) => !progressMap[item.id]).length
}

/**
 * Get human-readable interval text.
 */
export function getIntervalText(correctStreak) {
  const labels = ['4 Stunden', '1 Tag', '3 Tage', '7 Tage', '14 Tage', '30 Tage']
  const idx = Math.min(correctStreak, labels.length - 1)
  return labels[idx]
}
