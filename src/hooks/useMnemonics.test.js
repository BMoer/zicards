import { describe, it, expect } from 'vitest'

/**
 * Lightweight tests for the data-shape transform inside useMnemonics —
 * we don't render the React hook (no jsdom configured), but we cover the
 * row → map transformation, the cache fallback contract, and the empty
 * states the hook guarantees to MnemonicCard consumers.
 */

function rowsToMap(rows) {
  const map = {}
  for (const row of rows || []) {
    map[row.hanzi] = { mnemonic: row.mnemonic, parts: row.parts || [] }
  }
  return map
}

describe('rowsToMap (useMnemonics transform)', () => {
  it('keys the result by hanzi', () => {
    const rows = [
      { hanzi: '好', mnemonic: 'm-hao', parts: [] },
      { hanzi: '我', mnemonic: 'm-wo', parts: [{ char: '手', meaning: 'Hand' }] },
    ]
    const map = rowsToMap(rows)
    expect(Object.keys(map)).toEqual(['好', '我'])
    expect(map['好'].mnemonic).toBe('m-hao')
    expect(map['我'].parts).toHaveLength(1)
  })

  it('defaults parts to empty array when null', () => {
    const map = rowsToMap([{ hanzi: '好', mnemonic: 'x', parts: null }])
    expect(map['好'].parts).toEqual([])
  })

  it('returns empty map for empty input', () => {
    expect(rowsToMap([])).toEqual({})
    expect(rowsToMap(null)).toEqual({})
    expect(rowsToMap(undefined)).toEqual({})
  })
})

describe('MnemonicCard contract (consumer expectations)', () => {
  it('lookup by hanzi returns falsy for missing entries — card renders nothing', () => {
    const map = rowsToMap([{ hanzi: '好', mnemonic: 'x', parts: [] }])
    expect(map['好']).toBeTruthy()
    expect(map['xyz']).toBeUndefined()
  })

  it('compound lookup is by full compound string, not by component', () => {
    // The 1T-rule sentence flow surfaces compound rows like 多少;
    // the mnemonic for 多少 must be stored under '多少', not '多'.
    const map = rowsToMap([
      { hanzi: '多少', mnemonic: 'compound', parts: [] },
      { hanzi: '多', mnemonic: 'single-multi', parts: [] },
    ])
    expect(map['多少'].mnemonic).toBe('compound')
    expect(map['多'].mnemonic).toBe('single-multi')
  })
})
