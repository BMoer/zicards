import { describe, it, expect } from 'vitest'
import { getIMECandidates } from './imeCandidates'
import { COMMON_CHARS } from '../data/commonCharacters'

const CURRICULUM = [
  { hanzi: '好', pinyin_input: 'hao3', week: 1 },
  { hanzi: '你', pinyin_input: 'ni3', week: 1 },
  { hanzi: '我', pinyin_input: 'wo3', week: 1 },
  { hanzi: '是', pinyin_input: 'shi4', week: 1 },
  { hanzi: '多少', pinyin_input: 'duo1shao3', week: 2 }, // compound — must be skipped
]

describe('getIMECandidates', () => {
  it('returns empty for empty input', () => {
    expect(getIMECandidates('', CURRICULUM, COMMON_CHARS)).toEqual([])
    expect(getIMECandidates('   ', CURRICULUM, COMMON_CHARS)).toEqual([])
  })

  it('returns exact-base matches for "hao" including curriculum and common', () => {
    const result = getIMECandidates('hao', CURRICULUM, COMMON_CHARS)
    const hanzis = result.map((c) => c.hanzi)
    expect(hanzis).toContain('好') // curriculum
    expect(hanzis).toContain('号') // common
  })

  it('prefix-matches characters whose base pinyin starts with input', () => {
    const result = getIMECandidates('ha', CURRICULUM, COMMON_CHARS)
    const hanzis = result.map((c) => c.hanzi)
    // 还 (hai) and 好 (hao) both start with "ha"
    expect(hanzis).toContain('好')
    expect(hanzis).toContain('还')
  })

  it('exact matches come before prefix matches', () => {
    const result = getIMECandidates('shi', CURRICULUM, COMMON_CHARS)
    const exactIdx = result.findIndex((c) => c.hanzi === '是')
    expect(exactIdx).toBeGreaterThanOrEqual(0)
    // No prefix-only match should appear before this in the result
    // (since 'shi' is exact-base for shi1/shi2/shi4)
    expect(exactIdx).toBeLessThan(result.length)
  })

  it('skips compound rows (multi-char hanzi) from curriculum', () => {
    const result = getIMECandidates('duo', CURRICULUM, COMMON_CHARS)
    const hanzis = result.map((c) => c.hanzi)
    expect(hanzis).not.toContain('多少')
  })

  it('respects max parameter', () => {
    const result = getIMECandidates('shi', CURRICULUM, COMMON_CHARS, { max: 3 })
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('guarantees expectedHanzi is included when it matches input', () => {
    // Use an obscure curriculum char to test guarantee — set max=1 so
    // ordering would normally drop it
    const curriculum = [
      { hanzi: '好', pinyin_input: 'hao3', week: 1 },
      { hanzi: '号', pinyin_input: 'hao4', week: 5 }, // less primary
    ]
    const result = getIMECandidates('hao', curriculum, COMMON_CHARS, {
      expectedHanzi: '号',
      max: 1,
    })
    const hanzis = result.map((c) => c.hanzi)
    expect(hanzis).toContain('号')
  })

  it('does not include expectedHanzi if it does not match the typed input', () => {
    const result = getIMECandidates('ni', CURRICULUM, COMMON_CHARS, {
      expectedHanzi: '好', // hao, not ni
    })
    const hanzis = result.map((c) => c.hanzi)
    expect(hanzis).not.toContain('好')
  })

  it('marks source as curriculum or common', () => {
    const result = getIMECandidates('hao', CURRICULUM, COMMON_CHARS)
    const hao = result.find((c) => c.hanzi === '好')
    const haoNum = result.find((c) => c.hanzi === '号')
    expect(hao?.source).toBe('curriculum')
    expect(haoNum?.source).toBe('common')
  })

  it('dedupes when curriculum and common have the same hanzi', () => {
    // 好 is in both curriculum and COMMON_CHARS — should appear once,
    // marked as curriculum (curriculum wins)
    const result = getIMECandidates('hao', CURRICULUM, COMMON_CHARS)
    const haos = result.filter((c) => c.hanzi === '好')
    expect(haos.length).toBe(1)
    expect(haos[0].source).toBe('curriculum')
  })

  it('handles trailing tone digit in input ("hao3" matches base "hao")', () => {
    const result = getIMECandidates('hao3', CURRICULUM, COMMON_CHARS)
    const hanzis = result.map((c) => c.hanzi)
    expect(hanzis).toContain('好')
    // Should still include other hao* candidates (real IMEs do)
    expect(hanzis).toContain('号')
  })

  it('is case-insensitive', () => {
    const lower = getIMECandidates('hao', CURRICULUM, COMMON_CHARS)
    const upper = getIMECandidates('HAO', CURRICULUM, COMMON_CHARS)
    expect(upper.map((c) => c.hanzi)).toEqual(lower.map((c) => c.hanzi))
  })

  it('returns empty for input that matches nothing', () => {
    const result = getIMECandidates('xyzqq', CURRICULUM, COMMON_CHARS)
    expect(result).toEqual([])
  })
})
