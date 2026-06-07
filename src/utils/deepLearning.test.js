import { describe, it, expect } from 'vitest'
import {
  getDifficultChars,
  shouldOfferDeepLearning,
  DIFFICULT_MIN_PRACTICED,
  DIFFICULT_MAX_LEVEL,
  DEEP_LEARNING_SESSION_THRESHOLD,
} from './deepLearning'

const chars = [
  { id: 1, hanzi: '点' },
  { id: 2, hanzi: '分' },
  { id: 3, hanzi: '刻' },
  { id: 4, hanzi: '半' },
]

describe('getDifficultChars', () => {
  it('returns chars practiced >= 3 times and still at level <= 1', () => {
    const progress = {
      1: { level: 1, times_practiced: 5 }, // difficult
      2: { level: 2, times_practiced: 9 }, // mastered enough → not difficult
      3: { level: 0, times_practiced: 2 }, // too few practices → not difficult
      4: { level: 1, times_practiced: 3 }, // exactly at threshold → difficult
    }
    const res = getDifficultChars(chars, progress)
    // both level 1 → more-practiced-but-still-stuck (点, 5×) ranks above 半 (3×)
    expect(res.map((r) => r.char.hanzi)).toEqual(['点', '半'])
  })

  it('threshold constants gate inclusion', () => {
    const justUnder = {
      1: { level: DIFFICULT_MAX_LEVEL, times_practiced: DIFFICULT_MIN_PRACTICED - 1 },
    }
    expect(getDifficultChars(chars, justUnder)).toHaveLength(0)
    const justOver = {
      1: { level: DIFFICULT_MAX_LEVEL, times_practiced: DIFFICULT_MIN_PRACTICED },
    }
    expect(getDifficultChars(chars, justOver)).toHaveLength(1)
  })

  it('sorts hardest first: lower level, then more practice', () => {
    const progress = {
      1: { level: 1, times_practiced: 4 },
      3: { level: 0, times_practiced: 3 },
      4: { level: 1, times_practiced: 8 },
    }
    const res = getDifficultChars(chars, progress)
    // level 0 first, then the two level-1 by descending practice count
    expect(res.map((r) => r.char.hanzi)).toEqual(['刻', '半', '点'])
  })

  it('skips chars with no progress record', () => {
    expect(getDifficultChars(chars, { 1: { level: 1, times_practiced: 5 } })).toHaveLength(1)
  })

  it('handles missing/empty inputs', () => {
    expect(getDifficultChars(null, {})).toEqual([])
    expect(getDifficultChars(chars, null)).toEqual([])
  })
})

describe('shouldOfferDeepLearning', () => {
  it('offers only past the session threshold with difficult words present', () => {
    expect(shouldOfferDeepLearning(DEEP_LEARNING_SESSION_THRESHOLD, 2)).toBe(true)
    expect(shouldOfferDeepLearning(DEEP_LEARNING_SESSION_THRESHOLD - 1, 2)).toBe(false)
    expect(shouldOfferDeepLearning(DEEP_LEARNING_SESSION_THRESHOLD, 0)).toBe(false)
  })

  it('tolerates undefined args', () => {
    expect(shouldOfferDeepLearning(undefined, undefined)).toBe(false)
  })
})
