import { describe, it, expect } from 'vitest'
import {
  getShuffledWords,
  checkWordOrder,
  checkGapAnswer,
  checkTranslation,
  buildSentenceSession,
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

describe('checkGapAnswer', () => {
  it('exact hanzi match', () => {
    expect(checkGapAnswer('不', '不')).toBe(true)
  })

  it('wrong hanzi returns false', () => {
    expect(checkGapAnswer('好', '不')).toBe(false)
  })

  it('empty answer returns false', () => {
    expect(checkGapAnswer('', '不')).toBe(false)
    expect(checkGapAnswer('  ', '不')).toBe(false)
  })

  it('pinyin numbered match via sentence context', () => {
    const words = ['我', '不', '是', '学生']
    const pinyin = 'wǒ bù shì xuésheng'
    expect(checkGapAnswer('bu4', '不', words, pinyin)).toBe(true)
  })

  it('pinyin tone-marked match via sentence context', () => {
    const words = ['我', '不', '是', '学生']
    const pinyin = 'wǒ bù shì xuésheng'
    expect(checkGapAnswer('bù', '不', words, pinyin)).toBe(true)
  })

  it('wrong pinyin returns false', () => {
    const words = ['我', '不', '是', '学生']
    const pinyin = 'wǒ bù shì xuésheng'
    expect(checkGapAnswer('hao3', '不', words, pinyin)).toBe(false)
  })

  it('accepts multi-syllable word-level pinyin (中国 / zhongguo)', () => {
    const words = ['你', '是', '中国', '人', '吗', '？']
    const pinyin = 'Nǐ shì Zhōngguó rén ma?'
    expect(checkGapAnswer('Zhong1 guo3', '中国', words, pinyin)).toBe(true)
    expect(checkGapAnswer('zhongguo', '中国', words, pinyin)).toBe(true)
    expect(checkGapAnswer('Zhōngguó', '中国', words, pinyin)).toBe(true)
  })

  it('rejects wrong multi-syllable pinyin', () => {
    const words = ['你', '是', '中国', '人', '吗', '？']
    const pinyin = 'Nǐ shì Zhōngguó rén ma?'
    expect(checkGapAnswer('meiguo', '中国', words, pinyin)).toBe(false)
  })
})

// ─── checkTranslation ───────────────────────────────────────────────────────

describe('checkTranslation', () => {
  it('exact hanzi match', () => {
    expect(checkTranslation('我是学生。', '我是学生。', 'wǒ shì xuésheng')).toBe(true)
  })

  it('hanzi match ignoring punctuation', () => {
    expect(checkTranslation('我是学生', '我是学生。', 'wǒ shì xuésheng')).toBe(true)
  })

  it('pinyin base match (tones stripped)', () => {
    expect(checkTranslation('wo shi xuesheng', '我是学生。', 'wǒ shì xuésheng')).toBe(true)
  })

  it('wrong answer returns false', () => {
    expect(checkTranslation('你好', '我是学生。', 'wǒ shì xuésheng')).toBe(false)
  })

  it('empty answer returns false', () => {
    expect(checkTranslation('', '我是学生。', 'wǒ shì xuésheng')).toBe(false)
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
