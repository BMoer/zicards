import { describe, it, expect } from 'vitest'
import { isHanChar, extractDirectHanzi } from './directHanzi.js'

describe('isHanChar', () => {
  it('recognises a Han character', () => {
    expect(isHanChar('好')).toBe(true)
    expect(isHanChar('你')).toBe(true)
  })

  it('rejects latin, digits and punctuation', () => {
    expect(isHanChar('a')).toBe(false)
    expect(isHanChar('3')).toBe(false)
    expect(isHanChar('！')).toBe(false)
    expect(isHanChar('!')).toBe(false)
  })
})

describe('extractDirectHanzi', () => {
  it('returns [] for pinyin (no Han chars)', () => {
    expect(extractDirectHanzi('hao')).toEqual([])
    expect(extractDirectHanzi('nihao')).toEqual([])
  })

  it('extracts a single directly-typed character', () => {
    expect(extractDirectHanzi('好')).toEqual(['好'])
  })

  it('extracts a multi-character string in order', () => {
    expect(extractDirectHanzi('你好')).toEqual(['你', '好'])
  })

  it('drops punctuation typed alongside the Hànzì', () => {
    expect(extractDirectHanzi('你好！')).toEqual(['你', '好'])
  })

  it('keeps only the Han chars when pinyin and Hànzì are mixed', () => {
    expect(extractDirectHanzi('hao好')).toEqual(['好'])
  })

  it('handles empty / nullish input', () => {
    expect(extractDirectHanzi('')).toEqual([])
    expect(extractDirectHanzi(null)).toEqual([])
    expect(extractDirectHanzi(undefined)).toEqual([])
  })
})
