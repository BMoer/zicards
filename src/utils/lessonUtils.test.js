import { describe, it, expect } from 'vitest'
import {
  buildHanziMap,
  getSentenceCharIds,
  isSentenceUnlocked,
  getMissingCharCount,
  getUnlockedSentences,
} from './lessonUtils'

const CHARS = [
  { id: 'a', hanzi: '你' },
  { id: 'b', hanzi: '好' },
  { id: 'c', hanzi: '我' },
  { id: 'd', hanzi: '是' },
  { id: 'e', hanzi: '人' },
]

const hanziMap = buildHanziMap(CHARS)

const sentence = (words) => ({ words })

describe('isSentenceUnlocked (1T rule)', () => {
  it('unlocked when all chars are known', () => {
    const s = sentence(['你', '好'])
    const progress = { a: { level: 2 }, b: { level: 2 } }
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(true)
  })

  it('unlocked when exactly one char is unknown (1T allowance)', () => {
    const s = sentence(['你', '好', '我'])
    const progress = { a: { level: 1 }, b: { level: 1 } } // c (我) unknown
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(true)
  })

  it('unlocked when one char has no progress at all (treated as unknown)', () => {
    const s = sentence(['你', '好', '我'])
    const progress = { a: { level: 1 }, b: { level: 1 } } // c missing entirely
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(true)
  })

  it('locked when two or more chars are unknown', () => {
    const s = sentence(['你', '好', '我', '是'])
    const progress = { a: { level: 1 }, b: { level: 1 } } // c, d unknown
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(false)
  })

  it('unlocked when char is at level 1 (introduced) — no full mastery required', () => {
    const s = sentence(['你', '好'])
    const progress = { a: { level: 1 }, b: { level: 1 } }
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(true)
  })

  it('locked when chars are at level 0 (seen but not yet correctly answered)', () => {
    const s = sentence(['你', '好'])
    const progress = { a: { level: 0 }, b: { level: 0 } }
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(false)
  })

  it('skips punctuation when counting', () => {
    const s = sentence(['你', '好', '。'])
    const progress = { a: { level: 1 }, b: { level: 1 } }
    expect(isSentenceUnlocked(s, hanziMap, progress)).toBe(true)
  })

  it('unlocks sentences with no matching curriculum chars', () => {
    const s = sentence(['Z', 'X']) // chars not in our table
    expect(isSentenceUnlocked(s, hanziMap, {})).toBe(true)
  })

  it('counts each distinct char once even if it appears multiple times', () => {
    // 你你你 has 3 occurrences but only 1 distinct char
    const s = sentence(['你', '你', '你'])
    expect(isSentenceUnlocked(s, hanziMap, { a: { level: 1 } })).toBe(true)
    expect(isSentenceUnlocked(s, hanziMap, {})).toBe(true) // 1 unknown, allowed
  })
})

describe('getMissingCharCount', () => {
  it('returns 0 for fully unlocked sentence', () => {
    const s = sentence(['你', '好'])
    const progress = { a: { level: 1 }, b: { level: 1 } }
    expect(getMissingCharCount(s, hanziMap, progress)).toBe(0)
  })

  it('returns 0 when sentence is just barely unlocked (1 unknown allowed)', () => {
    const s = sentence(['你', '好', '我'])
    const progress = { a: { level: 1 }, b: { level: 1 } } // 1 unknown
    expect(getMissingCharCount(s, hanziMap, progress)).toBe(0)
  })

  it('returns 1 when 2 chars unknown (1 over the allowance)', () => {
    const s = sentence(['你', '好', '我', '是'])
    const progress = { a: { level: 1 }, b: { level: 1 } } // 2 unknown
    expect(getMissingCharCount(s, hanziMap, progress)).toBe(1)
  })

  it('returns the number of chars over the 1T allowance', () => {
    const s = sentence(['你', '好', '我', '是', '人'])
    expect(getMissingCharCount(s, hanziMap, {})).toBe(4) // 5 unknown - 1 allowed
  })
})

describe('getUnlockedSentences', () => {
  it('filters to only unlocked sentences', () => {
    const sentences = [
      { words: ['你', '好'] }, // 0 unknown
      { words: ['你', '好', '我'] }, // 1 unknown — still unlocked
      { words: ['你', '好', '我', '是'] }, // 2 unknown — locked
    ]
    const progress = { a: { level: 1 }, b: { level: 1 } }
    const result = getUnlockedSentences(sentences, CHARS, progress)
    expect(result).toHaveLength(2)
  })
})

describe('getSentenceCharIds', () => {
  it('returns unique char IDs, skipping punctuation', () => {
    const s = sentence(['你', '好', '。'])
    const ids = getSentenceCharIds(s, hanziMap)
    expect(ids).toEqual(['a', 'b'])
  })
})
