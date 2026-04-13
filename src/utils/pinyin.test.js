import { describe, it, expect } from 'vitest'
import {
  numberToToneMark,
  toneMarkToNumber,
  getPinyinBase,
  comparePinyin,
  isPinyinToneWrong,
  compareMeaning,
} from './pinyin.js'

// ─── numberToToneMark ────────────────────────────────────────────────────────

describe('numberToToneMark', () => {
  it('converts tone 1–4 correctly', () => {
    expect(numberToToneMark('ma1')).toBe('mā')
    expect(numberToToneMark('ma2')).toBe('má')
    expect(numberToToneMark('ma3')).toBe('mǎ')
    expect(numberToToneMark('ma4')).toBe('mà')
  })

  it('neutral tone (0 or 5) returns bare syllable', () => {
    expect(numberToToneMark('ma0')).toBe('ma')
    expect(numberToToneMark('ma5')).toBe('ma')
  })

  it('applies tone to correct vowel (a/e priority)', () => {
    expect(numberToToneMark('hao3')).toBe('hǎo')  // a gets it, not o
    expect(numberToToneMark('nei4')).toBe('nèi')   // e gets it
  })

  it('handles ü (v alias)', () => {
    expect(numberToToneMark('lv4')).toBe('lǜ')
  })

  it('returns input unchanged for unrecognised format', () => {
    expect(numberToToneMark('abc')).toBe('abc')
    expect(numberToToneMark('')).toBe('')
  })
})

// ─── toneMarkToNumber ────────────────────────────────────────────────────────

describe('toneMarkToNumber', () => {
  it('converts tone marks to numbered format', () => {
    expect(toneMarkToNumber('mā')).toBe('ma1')
    expect(toneMarkToNumber('má')).toBe('ma2')
    expect(toneMarkToNumber('mǎ')).toBe('ma3')
    expect(toneMarkToNumber('mà')).toBe('ma4')
  })

  it('bare syllable (neutral) returns syllable without number', () => {
    expect(toneMarkToNumber('ma')).toBe('ma')
  })

  it('is inverse of numberToToneMark for tones 1–4', () => {
    const inputs = ['ma1', 'ni3', 'hao3', 'shi4', 'gong1']
    inputs.forEach((n) => {
      expect(toneMarkToNumber(numberToToneMark(n))).toBe(n)
    })
  })
})

// ─── getPinyinBase ───────────────────────────────────────────────────────────

describe('getPinyinBase', () => {
  it('strips tone number', () => {
    expect(getPinyinBase('ma1')).toBe('ma')
    expect(getPinyinBase('ma0')).toBe('ma')
  })

  it('strips tone mark', () => {
    expect(getPinyinBase('mā')).toBe('ma')
    expect(getPinyinBase('nǐ')).toBe('ni')
  })

  it('bare syllable stays unchanged', () => {
    expect(getPinyinBase('ma')).toBe('ma')
  })

  it('handles empty/null', () => {
    expect(getPinyinBase('')).toBe('')
    expect(getPinyinBase(null)).toBe('')
  })
})

// ─── comparePinyin ───────────────────────────────────────────────────────────

describe('comparePinyin', () => {
  it('accepts exact numbered match', () => {
    expect(comparePinyin('ni3', 'ni3')).toBe(true)
  })

  it('accepts tone-marked input against numbered correct', () => {
    expect(comparePinyin('nǐ', 'ni3')).toBe(true)
    expect(comparePinyin('māma', 'ma1')).toBe(false) // multi vs single
  })

  it('rejects wrong tone', () => {
    expect(comparePinyin('ni2', 'ni3')).toBe(false)
  })

  it('neutral tone: bare base matches ma0', () => {
    expect(comparePinyin('ma', 'ma0')).toBe(true)
    expect(comparePinyin('ma5', 'ma0')).toBe(true)
  })

  it('returns false for empty inputs', () => {
    expect(comparePinyin('', 'ni3')).toBe(false)
    expect(comparePinyin('ni3', '')).toBe(false)
  })
})

// ─── isPinyinToneWrong ───────────────────────────────────────────────────────

describe('isPinyinToneWrong', () => {
  it('true when base matches but tone is wrong', () => {
    expect(isPinyinToneWrong('ni2', 'ni3')).toBe(true)
    expect(isPinyinToneWrong('ma1', 'ma4')).toBe(true)
  })

  it('false when completely correct', () => {
    expect(isPinyinToneWrong('ni3', 'ni3')).toBe(false)
  })

  it('false when base also differs', () => {
    expect(isPinyinToneWrong('wo3', 'ni3')).toBe(false)
  })
})

// ─── compareMeaning ──────────────────────────────────────────────────────────

describe('compareMeaning', () => {
  it('exact match', () => {
    expect(compareMeaning('gut', 'gut')).toBe(true)
  })

  it('case-insensitive', () => {
    expect(compareMeaning('Gut', 'gut')).toBe(true)
  })

  it('strips German articles', () => {
    expect(compareMeaning('die Lehrerin', 'Lehrerin')).toBe(true)
    expect(compareMeaning('ein Buch', 'Buch')).toBe(true)
  })

  it('ignores parenthetical', () => {
    expect(compareMeaning('Sie', 'Sie (Höflichkeitsform)')).toBe(true)
  })

  it('accepts substring of multi-meaning field', () => {
    // "ich, mich, mir" — user types just "ich"
    expect(compareMeaning('ich', 'ich, mich, mir')).toBe(true)
  })

  it('rejects completely wrong answer', () => {
    expect(compareMeaning('Hund', 'Buch')).toBe(false)
  })

  it('returns false for empty inputs', () => {
    expect(compareMeaning('', 'gut')).toBe(false)
  })
})
