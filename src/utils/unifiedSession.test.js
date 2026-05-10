import { describe, it, expect } from 'vitest'
import { buildUnifiedSession } from './unifiedSession'

const past = new Date(Date.now() - 1000).toISOString()

const charA = { id: 'a', hanzi: '晚', meaning: 'spät', week: 1, lesson: 'L1' }
const charB = { id: 'b', hanzi: '安', meaning: 'Ruhe', week: 1, lesson: 'L1' }
const charC = { id: 'c', hanzi: '晚安', meaning: 'gute Nacht', week: 1, lesson: 'L1' }

const oneWordSentence = {
  id: 's1',
  chinese: '晚安!',
  german: 'Gute Nacht!',
  pinyin: 'Wǎn\'ān!',
  words: ['晚安', '!'],
  week: 1,
}

const multiWordSentence = {
  id: 's2',
  chinese: '我是学生。',
  german: 'Ich bin Schüler.',
  pinyin: 'Wǒ shì xuésheng.',
  words: ['我', '是', '学生', '。'],
  week: 1,
  gap_word: '是',
}

describe('buildUnifiedSession — quiz-type mapping', () => {
  it('one-word sentence at L1 promotes order → translate (no trivial drag)', () => {
    const session = buildUnifiedSession(
      [charA, charB, charC],
      { a: { level: 3 }, b: { level: 3 }, c: { level: 3 } },
      [oneWordSentence],
      { s1: { level: 1, next_review: past, last_practiced: past } }
    )
    const item = session.find((i) => i.type === 'sentence')
    expect(item).toBeTruthy()
    expect(item.quizType).toBe('translate')
  })

  it('one-word sentence at L2 also promotes to translate (no gap_word needed)', () => {
    const session = buildUnifiedSession(
      [charA, charB, charC],
      { a: { level: 3 }, b: { level: 3 }, c: { level: 3 } },
      [oneWordSentence],
      { s1: { level: 2, next_review: past, last_practiced: past } }
    )
    const item = session.find((i) => i.type === 'sentence')
    expect(item.quizType).toBe('translate')
  })

  it('one-word sentence at L0 stays learn (intro card is fine)', () => {
    const session = buildUnifiedSession(
      [charA, charB, charC],
      { a: { level: 3 }, b: { level: 3 }, c: { level: 3 } },
      [oneWordSentence],
      {}
    )
    const item = session.find((i) => i.type === 'sentence')
    expect(item.quizType).toBe('learn')
  })

  it('multi-word sentence at L1 keeps order quiz', () => {
    const session = buildUnifiedSession(
      [charA, charB, charC, { id: 'd', hanzi: '我', meaning: 'ich', week: 1 }, { id: 'e', hanzi: '是', meaning: 'sein', week: 1 }, { id: 'f', hanzi: '学生', meaning: 'Schüler', week: 1 }],
      { a: { level: 3 }, b: { level: 3 }, c: { level: 3 }, d: { level: 3 }, e: { level: 3 }, f: { level: 3 } },
      [multiWordSentence],
      { s2: { level: 1, next_review: past, last_practiced: past } }
    )
    const item = session.find((i) => i.type === 'sentence')
    expect(item.quizType).toBe('order')
  })

  it('character at L3 maps to ime', () => {
    const session = buildUnifiedSession(
      [charA],
      { a: { level: 3, next_review: past, last_practiced: past } },
      [],
      {}
    )
    expect(session[0].quizType).toBe('ime')
  })

  it('character at L2 maps to mc-hanzi', () => {
    const session = buildUnifiedSession(
      [charA],
      { a: { level: 2, next_review: past, last_practiced: past } },
      [],
      {}
    )
    expect(session[0].quizType).toBe('mc-hanzi')
  })
})
