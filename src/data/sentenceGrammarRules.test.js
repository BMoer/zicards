import { describe, it, expect } from 'vitest'
import {
  SENTENCE_GRAMMAR_RULES,
  getSentenceGrammarRule,
} from './sentenceGrammarRules'

/**
 * Guards the grammar dataset the deep-learning sentence mode reads. The
 * user-supplied format is fixed (2026-06-07): each rule shows exactly one
 * correct and at least one wrong example, Chinese in Simplified. These
 * tests fail fast if a newly transcribed rule breaks that contract.
 */
describe('SENTENCE_GRAMMAR_RULES dataset', () => {
  it('has unique ids', () => {
    const ids = SENTENCE_GRAMMAR_RULES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every rule has a title and a non-empty summary', () => {
    for (const r of SENTENCE_GRAMMAR_RULES) {
      expect(r.title, r.id).toBeTruthy()
      expect(r.summary?.length, r.id).toBeGreaterThan(10)
    }
  })

  it('every rule has at least one correct and one wrong example', () => {
    for (const r of SENTENCE_GRAMMAR_RULES) {
      const correct = r.examples.filter((e) => e.correct)
      const wrong = r.examples.filter((e) => !e.correct)
      expect(correct.length, `${r.id} correct`).toBeGreaterThanOrEqual(1)
      expect(wrong.length, `${r.id} wrong`).toBeGreaterThanOrEqual(1)
    }
  })

  it('wrong examples explain why they are wrong (note)', () => {
    for (const r of SENTENCE_GRAMMAR_RULES) {
      for (const e of r.examples.filter((ex) => !ex.correct)) {
        expect(e.note?.length, `${r.id} wrong.note`).toBeGreaterThan(5)
      }
    }
  })

  it('correct examples carry a German translation', () => {
    for (const r of SENTENCE_GRAMMAR_RULES) {
      for (const e of r.examples.filter((ex) => ex.correct)) {
        expect(e.de, `${r.id} correct.de`).toBeTruthy()
      }
    }
  })

  it('every example contains at least one Han character', () => {
    const hasHan = (s) => /\p{Script=Han}/u.test(s)
    for (const r of SENTENCE_GRAMMAR_RULES) {
      for (const e of r.examples) {
        expect(hasHan(e.zh), `${r.id}: ${e.zh}`).toBe(true)
      }
    }
  })

  it('getSentenceGrammarRule looks up by id, null when missing', () => {
    expect(getSentenceGrammarRule('ma-question')?.title).toBe(
      'Die Fragepartikel 吗'
    )
    expect(getSentenceGrammarRule('nope')).toBeNull()
  })
})
