import { describe, it, expect } from 'vitest'
import { isDoubledWord, displayHanzi } from './pinyin'

describe('isDoubledWord', () => {
  it('true for canonical doubled forms', () => {
    expect(isDoubledWord({ hanzi: '姐', word: '姐姐' })).toBe(true)
    expect(isDoubledWord({ hanzi: '妈', word: '妈妈' })).toBe(true)
  })

  it('false when word is not doubled', () => {
    expect(isDoubledWord({ hanzi: '我', word: null })).toBe(false)
    expect(isDoubledWord({ hanzi: '你', word: '你好' })).toBe(false)
  })

  it('false when hanzi does not match the doubled char', () => {
    expect(isDoubledWord({ hanzi: '好', word: '姐姐' })).toBe(false)
  })

  it('false on missing fields', () => {
    expect(isDoubledWord({})).toBe(false)
    expect(isDoubledWord(null)).toBe(false)
    expect(isDoubledWord({ hanzi: '姐' })).toBe(false)
    expect(isDoubledWord({ word: '姐姐' })).toBe(false)
  })
})

describe('displayHanzi (audio-display sync source-of-truth)', () => {
  it('returns the doubled word for doubled-form rows', () => {
    expect(displayHanzi({ hanzi: '姐', word: '姐姐' })).toBe('姐姐')
  })

  it('returns the bare hanzi for normal single-char rows', () => {
    expect(displayHanzi({ hanzi: '我', word: null })).toBe('我')
    expect(displayHanzi({ hanzi: '我' })).toBe('我')
  })

  it('returns the bare hanzi when word is a non-doubled compound', () => {
    // This is the bug-fix case: 上 (shang) had word=上午 (shangwu) in
    // legacy data; the audio used to read 上午 while the card showed 上.
    // displayHanzi must return just 上 so audio matches the visual.
    expect(displayHanzi({ hanzi: '上', word: '上午' })).toBe('上')
    expect(displayHanzi({ hanzi: '下', word: '下午' })).toBe('下')
  })

  it('returns the multi-char hanzi for compound rows (hanzi="上午", word=null)', () => {
    expect(displayHanzi({ hanzi: '上午', word: null })).toBe('上午')
  })

  it('handles null/undefined character without crashing', () => {
    expect(displayHanzi(null)).toBe('')
    expect(displayHanzi(undefined)).toBe('')
  })
})
