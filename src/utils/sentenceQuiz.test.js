import { describe, it, expect } from 'vitest'
import {
  getShuffledWords,
  checkWordOrder,
  checkGapAnswer,
  checkTranslation,
  buildSentenceSession,
  findGapSpan,
} from './sentenceQuiz.js'

// ─── getShuffledWords ────────────────────────────────────────────────────────

describe('getShuffledWords', () => {
  it('separates punctuation from draggable words', () => {
    const words = ['我', '是', '学生', '。']
    const { shuffled, trailing } = getShuffledWords(words)
    expect(trailing).toEqual(['。'])
    expect(shuffled).not.toContain('。')
    expect(shuffled).toHaveLength(3)
  })

  it('contains all non-punctuation words', () => {
    const words = ['你', '好', '吗', '？']
    const { shuffled } = getShuffledWords(words)
    expect(shuffled.sort()).toEqual(['你', '好', '吗'].sort())
  })

  it('no punctuation → empty trailing', () => {
    const words = ['我', '是']
    const { trailing } = getShuffledWords(words)
    expect(trailing).toEqual([])
  })
})

// ─── checkWordOrder ──────────────────────────────────────────────────────────

describe('checkWordOrder', () => {
  it('correct order returns true', () => {
    expect(checkWordOrder(['我', '是', '学生'], ['我', '是', '学生', '。'])).toBe(true)
  })

  it('wrong order returns false', () => {
    expect(checkWordOrder(['是', '我', '学生'], ['我', '是', '学生', '。'])).toBe(false)
  })

  it('ignores punctuation in correctWords', () => {
    expect(checkWordOrder(['你', '好'], ['你', '好', '！'])).toBe(true)
  })

  it('wrong length returns false', () => {
    expect(checkWordOrder(['我'], ['我', '是', '学生', '。'])).toBe(false)
  })
})

// ─── checkGapAnswer ──────────────────────────────────────────────────────────

describe('checkGapAnswer (Hànzì-only after IME pivot)', () => {
  it('exact hanzi match', () => {
    expect(checkGapAnswer('不', '不')).toBe(true)
  })

  it('multi-char hanzi exact match', () => {
    expect(checkGapAnswer('中国', '中国')).toBe(true)
  })

  it('wrong hanzi returns false', () => {
    expect(checkGapAnswer('好', '不')).toBe(false)
  })

  it('empty answer returns false', () => {
    expect(checkGapAnswer('', '不')).toBe(false)
    expect(checkGapAnswer('  ', '不')).toBe(false)
  })

  it('rejects pinyin input — only hanzi accepted now', () => {
    expect(checkGapAnswer('bu4', '不')).toBe(false)
    expect(checkGapAnswer('bù', '不')).toBe(false)
    expect(checkGapAnswer('bu', '不')).toBe(false)
  })

  it('trims whitespace', () => {
    expect(checkGapAnswer(' 不 ', '不')).toBe(true)
  })
})

// ─── checkTranslation ───────────────────────────────────────────────────────

describe('checkTranslation (Hànzì-only after IME pivot)', () => {
  it('exact hanzi match', () => {
    expect(checkTranslation('我是学生。', '我是学生。')).toBe(true)
  })

  it('hanzi match ignoring trailing punctuation', () => {
    expect(checkTranslation('我是学生', '我是学生。')).toBe(true)
  })

  it('hanzi match ignoring whitespace', () => {
    expect(checkTranslation('我 是 学生', '我是学生。')).toBe(true)
  })

  it('rejects pinyin even when phonetically correct', () => {
    expect(checkTranslation('wo shi xuesheng', '我是学生。')).toBe(false)
    expect(checkTranslation('wǒ shì xuésheng', '我是学生。')).toBe(false)
  })

  it('wrong answer returns false', () => {
    expect(checkTranslation('你好', '我是学生。')).toBe(false)
  })

  it('empty answer returns false', () => {
    expect(checkTranslation('', '我是学生。')).toBe(false)
  })
})

// ─── findGapSpan ─────────────────────────────────────────────────────────────

describe('findGapSpan', () => {
  it('locates a gap_word that is a single token', () => {
    expect(findGapSpan(['这', '是', '词典', '。'], '词典')).toEqual({ start: 2, end: 2 })
  })

  it('locates a gap_word split across multiple single-char tokens', () => {
    // 这是我们全班的照片。— words tokenise 全班 as ['全','班']; gap_word is '全班'.
    // Regression for "Aufgabe ist verbuggt … voller Satz steht bereits dort" (2026-05-23):
    // the old words.indexOf('全班') === -1 and the whole sentence rendered with no blank.
    const words = ['这', '是', '我们', '全', '班', '的', '照片', '。']
    expect(findGapSpan(words, '全班')).toEqual({ start: 3, end: 4 })
  })

  it('returns null when the gap_word is not present', () => {
    expect(findGapSpan(['我', '是'], '你')).toBeNull()
  })

  it('does not partial-match a shorter prefix', () => {
    // '全部' must not match against the '全' token alone.
    expect(findGapSpan(['全', '部', '人'], '全班')).toBeNull()
  })

  it('handles missing/empty inputs defensively', () => {
    expect(findGapSpan(['我'], null)).toBeNull()
    expect(findGapSpan(null, '我')).toBeNull()
    expect(findGapSpan(['我'], '')).toBeNull()
  })
})

// ─── buildSentenceSession ────────────────────────────────────────────────────

describe('buildSentenceSession', () => {
  const now = Date.now()
  const past = new Date(now - 1000).toISOString()

  const makeSentence = (id, week = 1) => ({ id, week })
  const sentences = Array.from({ length: 15 }, (_, i) => makeSentence(`s${i}`, (i % 3) + 1))

  it('empty input returns empty array', () => {
    expect(buildSentenceSession([], {})).toEqual([])
  })

  it('all new → quizType learn', () => {
    const session = buildSentenceSession(sentences, {})
    expect(session.every((s) => s.quizType === 'learn')).toBe(true)
  })

  it('assigns correct quizType per level', () => {
    const s = sentences[0]
    const run = (level) =>
      buildSentenceSession(
        [s],
        { [s.id]: { level, next_review: past, last_practiced: past } }
      )[0].quizType

    expect(run(1)).toBe('order')
    expect(run(2)).toBe('gap')
    expect(run(3)).toBe('translate')
  })

  it('caps session at 10 items', () => {
    const session = buildSentenceSession(sentences, {})
    expect(session.length).toBeLessThanOrEqual(10)
  })

  it('due sentences come before new ones', () => {
    const due = makeSentence('due', 1)
    const newSent = makeSentence('new', 1)
    const progressMap = {
      due: { level: 1, next_review: past, last_practiced: past },
    }
    const session = buildSentenceSession([newSent, due], progressMap)
    expect(session[0].sentence.id).toBe('due')
  })
})
