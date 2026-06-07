import { describe, it, expect, beforeEach } from 'vitest'
import { getCompletedSessions, incrementCompletedSessions } from './sessionStore'

// Minimal localStorage stub (test env is 'node' — no DOM storage).
beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  }
})

describe('completed-session counter', () => {
  it('starts at zero', () => {
    expect(getCompletedSessions()).toBe(0)
  })

  it('increments and persists', () => {
    expect(incrementCompletedSessions()).toBe(1)
    expect(incrementCompletedSessions()).toBe(2)
    expect(getCompletedSessions()).toBe(2)
  })

  it('returns 0 gracefully when storage throws', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(getCompletedSessions()).toBe(0)
    expect(incrementCompletedSessions()).toBe(0)
  })
})
