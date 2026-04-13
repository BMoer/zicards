import { describe, it, expect } from 'vitest'
import { generateMCOptions, buildSession } from './quiz.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeChar = (id, week = 1, meaning = `meaning-${id}`, hanzi = `字${id}`) => ({
  id,
  hanzi,
  meaning,
  week,
})

const chars = [
  makeChar('a', 1, 'ich', '我'),
  makeChar('b', 1, 'du', '你'),
  makeChar('c', 1, 'er', '他'),
  makeChar('d', 1, 'sie', '她'),
  makeChar('e', 2, 'gut', '好'),
  makeChar('f', 2, 'schlecht', '坏'),
]

// ─── generateMCOptions ───────────────────────────────────────────────────────

describe('generateMCOptions', () => {
  it('returns exactly 4 options', () => {
    const opts = generateMCOptions(chars[0], chars, 'meaning')
    expect(opts).toHaveLength(4)
  })

  it('includes exactly one correct answer', () => {
    const opts = generateMCOptions(chars[0], chars, 'meaning')
    const correct = opts.filter((o) => o.isCorrect)
    expect(correct).toHaveLength(1)
    expect(correct[0].value).toBe('ich')
  })

  it('has no duplicate values', () => {
    const opts = generateMCOptions(chars[0], chars, 'meaning')
    const values = opts.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('works for hanzi field (Stufe 3)', () => {
    const opts = generateMCOptions(chars[0], chars, 'hanzi')
    expect(opts.find((o) => o.isCorrect).value).toBe('我')
    expect(opts).toHaveLength(4)
  })

  it('prefers same-week distractors', () => {
    // chars[0] is week 1; week-1 distractors are b, c, d
    const opts = generateMCOptions(chars[0], chars, 'meaning')
    const distValues = opts.filter((o) => !o.isCorrect).map((o) => o.value)
    const week1Meanings = ['du', 'er', 'sie']
    const fromSameWeek = distValues.filter((v) => week1Meanings.includes(v))
    expect(fromSameWeek.length).toBeGreaterThan(0)
  })
})

// ─── buildSession ────────────────────────────────────────────────────────────

describe('buildSession', () => {
  const now = Date.now()
  const past = new Date(now - 1000).toISOString()
  const future = new Date(now + 1e9).toISOString()

  it('returns empty array for no characters', () => {
    expect(buildSession([], {})).toEqual([])
  })

  it('all new cards → quizType learn, ordered by week', () => {
    const session = buildSession(chars, {})
    expect(session.every((s) => s.quizType === 'learn')).toBe(true)
    // week ordering: week-1 chars before week-2
    const weeks = session.map((s) => s.character.week)
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b))
  })

  it('assigns correct quizType per level', () => {
    const progressMap = {
      a: { level: 1, next_review: past, last_practiced: past },
      b: { level: 2, next_review: past, last_practiced: past },
      c: { level: 3, next_review: past, last_practiced: past },
    }
    const session = buildSession(chars, progressMap)
    const byId = Object.fromEntries(session.map((s) => [s.character.id, s]))
    expect(byId['a'].quizType).toBe('mc-meaning')
    expect(byId['b'].quizType).toBe('freetext')
    expect(byId['c'].quizType).toBe('mc-hanzi')
  })

  it('due cards come before new cards', () => {
    const progressMap = {
      e: { level: 1, next_review: past, last_practiced: past }, // due
    }
    const session = buildSession(chars, progressMap)
    const idx = session.findIndex((s) => s.character.id === 'e')
    const newIdx = session.findIndex(
      (s) => !progressMap[s.character.id] && s.quizType === 'learn'
    )
    expect(idx).toBeLessThan(newIdx)
  })

  it('caps session at 15 items', () => {
    const many = Array.from({ length: 30 }, (_, i) => makeChar(`x${i}`, 1))
    const session = buildSession(many, {})
    expect(session.length).toBeLessThanOrEqual(15)
  })

  it('not-due cards are excluded when due+new fills the session', () => {
    // buildSession caps new cards at 5 per session.
    // 10 due + 5 new = 15 → no room for not-due.
    const due10 = Array.from({ length: 10 }, (_, i) => makeChar(`d${i}`, 1))
    const new5 = Array.from({ length: 5 }, (_, i) => makeChar(`n${i}`, 1))
    const notDue5 = Array.from({ length: 5 }, (_, i) => makeChar(`nd${i}`, 1))
    const all = [...due10, ...new5, ...notDue5]

    const progressMap = {}
    due10.forEach((c) => {
      progressMap[c.id] = { level: 1, next_review: past, last_practiced: past }
    })
    notDue5.forEach((c) => {
      progressMap[c.id] = { level: 1, next_review: future, last_practiced: past }
    })

    const session = buildSession(all, progressMap)
    expect(session.length).toBe(15)
    const notDueIds = new Set(notDue5.map((c) => c.id))
    expect(session.some((s) => notDueIds.has(s.character.id))).toBe(false)
  })
})
