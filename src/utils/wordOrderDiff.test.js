import { describe, it, expect } from 'vitest'
import { findSingleMisplacement } from './wordOrderDiff'

describe('findSingleMisplacement', () => {
  it('detects 都 in the wrong slot (real failing case from feedback)', () => {
    const user    = ['我', '妹妹', '和', '都', '我', '弟弟', '是', '学生']
    const correct = ['我', '妹妹', '和', '我', '弟弟', '都', '是', '学生']
    expect(findSingleMisplacement(user, correct)).toEqual({
      word: '都',
      userIndex: 3,
      correctIndex: 5,
    })
  })

  it('returns null for fully correct order', () => {
    const a = ['我', '是', '学生']
    expect(findSingleMisplacement(a, [...a])).toBeNull()
  })

  it('returns null when multiset differs', () => {
    expect(findSingleMisplacement(['我', '是'], ['你', '是'])).toBeNull()
  })

  it('reports a valid single-move interpretation for adjacent swap', () => {
    // ['B','A','C'] → ['A','B','C'] is reducible to "move A from 1 to 0"
    // OR "move B from 0 to 1". Either is acceptable; we just check the
    // result is internally consistent (removing the named word at the
    // named indices yields equal arrays).
    const user    = ['B', 'A', 'C']
    const correct = ['A', 'B', 'C']
    const m = findSingleMisplacement(user, correct)
    expect(m).not.toBeNull()
    const um = [...user.slice(0, m.userIndex), ...user.slice(m.userIndex + 1)]
    const cm = [...correct.slice(0, m.correctIndex), ...correct.slice(m.correctIndex + 1)]
    expect(um).toEqual(cm)
    expect(user[m.userIndex]).toBe(m.word)
  })

  it('returns null for a true multi-displacement (3-cycle without single-move solution)', () => {
    // ['B','C','A','D'] → ['A','B','C','D'] cannot be fixed by moving one
    // element: removing any single word from user does not match removing
    // any single word from correct.
    // Actually this CAN be solved by moving A: remove user[2]='A' → ['B','C','D'],
    // remove correct[0]='A' → ['B','C','D']. Equal. So this returns A.
    // Use a case that genuinely needs 2 moves instead:
    const u2 = ['A', 'D', 'C', 'B']
    const c2 = ['A', 'B', 'C', 'D']
    expect(findSingleMisplacement(u2, c2)).toBeNull()
  })

  it('returns null on length mismatch', () => {
    expect(findSingleMisplacement(['a', 'b'], ['a', 'b', 'c'])).toBeNull()
  })

  it('returns null for arrays under length 2', () => {
    expect(findSingleMisplacement(['a'], ['a'])).toBeNull()
    expect(findSingleMisplacement([], [])).toBeNull()
  })

  it('handles 也 misplacement', () => {
    const user    = ['也', '我', '是', '学生']
    const correct = ['我', '也', '是', '学生']
    expect(findSingleMisplacement(user, correct)).toEqual({
      word: '也',
      userIndex: 0,
      correctIndex: 1,
    })
  })
})
