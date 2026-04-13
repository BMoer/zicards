import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateNextReview,
  isDue,
  countDue,
  countNew,
  getIntervalText,
} from './spaced.js'

// ─── calculateNextReview ─────────────────────────────────────────────────────

describe('calculateNextReview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR

  it('streak 0 → 4 hours from now', () => {
    const result = new Date(calculateNextReview(0))
    expect(result.getTime()).toBe(Date.now() + 4 * HOUR)
  })

  it('streak 1 → 1 day', () => {
    const result = new Date(calculateNextReview(1))
    expect(result.getTime()).toBe(Date.now() + DAY)
  })

  it('streak 2 → 3 days', () => {
    const result = new Date(calculateNextReview(2))
    expect(result.getTime()).toBe(Date.now() + 3 * DAY)
  })

  it('streak 3 → 7 days', () => {
    const result = new Date(calculateNextReview(3))
    expect(result.getTime()).toBe(Date.now() + 7 * DAY)
  })

  it('streak 4 → 14 days', () => {
    const result = new Date(calculateNextReview(4))
    expect(result.getTime()).toBe(Date.now() + 14 * DAY)
  })

  it('streak 5+ → capped at 30 days', () => {
    const r5 = new Date(calculateNextReview(5)).getTime()
    const r99 = new Date(calculateNextReview(99)).getTime()
    expect(r5).toBe(Date.now() + 30 * DAY)
    expect(r99).toBe(r5) // cap
  })

  it('streak grows beyond 5 → capped at 30 days (max level behaviour)', () => {
    // At level 3 (max), streak is no longer reset — it keeps growing.
    // calculateNextReview caps at index 5 (30 days) regardless.
    const r6 = new Date(calculateNextReview(6)).getTime()
    const r10 = new Date(calculateNextReview(10)).getTime()
    expect(r6).toBe(Date.now() + 30 * DAY)
    expect(r10).toBe(r6)
  })

  it('returns an ISO string', () => {
    const result = calculateNextReview(1)
    expect(typeof result).toBe('string')
    expect(() => new Date(result)).not.toThrow()
  })
})

// ─── isDue ───────────────────────────────────────────────────────────────────

describe('isDue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('null → always due (new card)', () => {
    expect(isDue(null)).toBe(true)
  })

  it('past date → due', () => {
    expect(isDue('2026-01-04T12:00:00Z')).toBe(true)
  })

  it('future date → not due', () => {
    expect(isDue('2026-01-06T12:00:00Z')).toBe(false)
  })

  it('exactly now → due', () => {
    expect(isDue('2026-01-05T12:00:00Z')).toBe(true)
  })
})

// ─── countDue ────────────────────────────────────────────────────────────────

describe('countDue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('counts only overdue entries', () => {
    const progressMap = {
      a: { next_review: '2026-01-04T00:00:00Z' }, // due
      b: { next_review: '2026-01-06T00:00:00Z' }, // not due
      c: { next_review: null },                    // due (new)
    }
    expect(countDue(progressMap)).toBe(2)
  })

  it('empty map returns 0', () => {
    expect(countDue({})).toBe(0)
  })
})

// ─── countNew ────────────────────────────────────────────────────────────────

describe('countNew', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('counts items with no progress entry', () => {
    const progressMap = { a: { level: 1 } }
    expect(countNew(items, progressMap)).toBe(2)
  })

  it('all new → full count', () => {
    expect(countNew(items, {})).toBe(3)
  })

  it('all seen → 0', () => {
    const progressMap = { a: {}, b: {}, c: {} }
    expect(countNew(items, progressMap)).toBe(0)
  })
})

// ─── getIntervalText ─────────────────────────────────────────────────────────

describe('getIntervalText', () => {
  it('returns correct labels', () => {
    expect(getIntervalText(0)).toBe('4 Stunden')
    expect(getIntervalText(1)).toBe('1 Tag')
    expect(getIntervalText(2)).toBe('3 Tage')
    expect(getIntervalText(5)).toBe('30 Tage')
  })

  it('caps at last label for high streaks', () => {
    expect(getIntervalText(99)).toBe('30 Tage')
  })
})
