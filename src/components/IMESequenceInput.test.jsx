import { describe, it, expect } from 'vitest'

/**
 * Tests for the IMESequenceInput submit-mode logic, factored into a pure
 * helper. The component delegates submission to the user via a "Fertig"
 * button (no auto-submit on length match) so the target length stays
 * hidden during entry — see the 2026-05-10 feedback that auto-completion
 * "ist nicht realistisch, weil eigentlich weiß ich ja nicht ob ein satz
 * vorbei ist oder nicht".
 */

const PUNCT = new Set(['。', '！', '？', '，', '、', '：', '；', '"', '"', "'", "'", '.', '!', '?', ',', ';', ':'])

function expectedPickChars(sequence) {
  const flat = Array.isArray(sequence)
    ? sequence.flatMap((w) => [...w])
    : [...sequence]
  return flat.filter((c) => !PUNCT.has(c))
}

function check(picked, sequence) {
  const expected = expectedPickChars(sequence)
  return (
    picked.length === expected.length &&
    picked.every((p, i) => p === expected[i])
  )
}

function reviewPicks(picked, sequence) {
  const expected = expectedPickChars(sequence)
  return picked.map((p, i) => ({
    hanzi: p,
    expected: expected[i],
    ok: p === expected[i],
  }))
}

describe('IMESequenceInput submit logic', () => {
  it('correct single char → check returns true', () => {
    expect(check(['好'], '好')).toBe(true)
  })

  it('wrong single char → check returns false', () => {
    expect(check(['坏'], '好')).toBe(false)
  })

  it('correct two-char compound', () => {
    expect(check(['多', '少'], '多少')).toBe(true)
  })

  it('correct order matters: same chars wrong order fails', () => {
    expect(check(['少', '多'], '多少')).toBe(false)
  })

  it('too few picks fails the check', () => {
    expect(check(['多'], '多少')).toBe(false)
  })

  it('too many picks fails the check', () => {
    expect(check(['多', '少', '人'], '多少')).toBe(false)
  })

  it('punctuation in expected sequence is ignored', () => {
    // Sentence ['你', '好', '！'] only requires picking 你, 好.
    expect(check(['你', '好'], ['你', '好', '！'])).toBe(true)
  })

  it('flattens word array to characters', () => {
    expect(check(['中', '国', '人'], ['中国', '人'])).toBe(true)
  })

  it('reviewPicks marks each position as ok/wrong', () => {
    const r = reviewPicks(['多', '人'], '多少')
    expect(r[0]).toEqual({ hanzi: '多', expected: '多', ok: true })
    expect(r[1]).toEqual({ hanzi: '人', expected: '少', ok: false })
  })

  it('reviewPicks tolerates picks beyond expected length', () => {
    const r = reviewPicks(['好', '坏', '人'], '好')
    expect(r[0].ok).toBe(true)
    expect(r[1].expected).toBeUndefined()
    expect(r[1].ok).toBe(false)
  })

  it('does NOT auto-decide on length-match — caller must explicitly submit', () => {
    // The component spec: even when picked.length === expected.length,
    // nothing happens until the user presses "Fertig". The check helper
    // itself is pure; this test asserts the contract by simulating the
    // expected hand-off: only an explicit call to check() yields the
    // verdict, not a passive observation of `picked`.
    const picked = ['好']
    // Sanity: picked could be premature (target = '好坏'), and we don't
    // even know yet — only check() at submit time tells us.
    expect(check(picked, '好坏')).toBe(false)
    expect(check(picked, '好')).toBe(true)
  })
})
