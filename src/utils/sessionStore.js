/**
 * Persist and restore session state via sessionStorage.
 * Prevents losing progress when minimizing or switching tabs.
 */

const CHAR_SESSION_KEY = 'zicards-char-session'
const SENT_SESSION_KEY = 'zicards-sent-session'

export function saveCharSession(state) {
  try {
    sessionStorage.setItem(CHAR_SESSION_KEY, JSON.stringify(state))
  } catch {}
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
  } catch {}
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
  } catch {}
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
