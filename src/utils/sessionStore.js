/**
 * Persist and restore session state via sessionStorage.
 * Prevents losing progress when minimizing or switching tabs.
 */

const CHAR_SESSION_KEY = 'zicards-char-session'
const SENT_SESSION_KEY = 'zicards-sent-session'

export function saveCharSession(state) {
  try {
    sessionStorage.setItem(CHAR_SESSION_KEY, JSON.stringify(state))
  } catch {
    /* sessionStorage unavailable (private mode / quota) — ignore */
  }
}

export function loadCharSession() {
  try {
    const raw = sessionStorage.getItem(CHAR_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCharSession() {
  sessionStorage.removeItem(CHAR_SESSION_KEY)
}

export function saveSentenceSession(state) {
  try {
    sessionStorage.setItem(SENT_SESSION_KEY, JSON.stringify(state))
  } catch {
    /* sessionStorage unavailable (private mode / quota) — ignore */
  }
}

export function loadSentenceSession() {
  try {
    const raw = sessionStorage.getItem(SENT_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSentenceSession() {
  sessionStorage.removeItem(SENT_SESSION_KEY)
}

// Unified session persistence
const UNIFIED_SESSION_KEY = 'zicards-unified-session'

export function saveUnifiedSession(state) {
  try {
    sessionStorage.setItem(UNIFIED_SESSION_KEY, JSON.stringify(state))
  } catch {
    /* sessionStorage unavailable (private mode / quota) — ignore */
  }
}

export function loadUnifiedSession() {
  try {
    const raw = sessionStorage.getItem(UNIFIED_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearUnifiedSession() {
  sessionStorage.removeItem(UNIFIED_SESSION_KEY)
}

// Count of completed learning sessions — persisted in localStorage so it
// survives across days/tabs (used to proactively offer the deep-learning
// mode after a handful of rounds).
const COMPLETED_SESSIONS_KEY = 'zicards-completed-sessions'

export function getCompletedSessions() {
  try {
    return parseInt(localStorage.getItem(COMPLETED_SESSIONS_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

export function incrementCompletedSessions() {
  try {
    const next = getCompletedSessions() + 1
    localStorage.setItem(COMPLETED_SESSIONS_KEY, String(next))
    return next
  } catch {
    return 0
  }
}
