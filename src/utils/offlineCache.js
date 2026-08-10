/**
 * Offline data cache using localStorage.
 * Caches characters, sentences, and progress for offline use.
 * Queues progress updates for sync when back online.
 */

const KEYS = {
  characters: 'zicards-cache-characters',
  sentences: 'zicards-cache-sentences',
  charProgress: 'zicards-cache-char-progress',
  sentProgress: 'zicards-cache-sent-progress',
  mnemonics: 'zicards-cache-mnemonics',
  pendingUpdates: 'zicards-pending-updates',
}

// --- Cache getters/setters ---

export function cacheCharacters(data) {
  try { localStorage.setItem(KEYS.characters, JSON.stringify(data)) } catch { /* best-effort: storage full/unavailable, cache write skipped */ }
}

export function getCachedCharacters() {
  try {
    const raw = localStorage.getItem(KEYS.characters)
    return raw ? JSON.parse(raw) : null
  } catch { return null /* best-effort: corrupt/unavailable cache treated as empty */ }
}

export function cacheSentences(data) {
  try { localStorage.setItem(KEYS.sentences, JSON.stringify(data)) } catch { /* best-effort: storage full/unavailable, cache write skipped */ }
}

export function getCachedSentences() {
  try {
    const raw = localStorage.getItem(KEYS.sentences)
    return raw ? JSON.parse(raw) : null
  } catch { return null /* best-effort: corrupt/unavailable cache treated as empty */ }
}

export function cacheCharProgress(data) {
  try { localStorage.setItem(KEYS.charProgress, JSON.stringify(data)) } catch { /* best-effort: storage full/unavailable, cache write skipped */ }
}

export function getCachedCharProgress() {
  try {
    const raw = localStorage.getItem(KEYS.charProgress)
    return raw ? JSON.parse(raw) : null
  } catch { return null /* best-effort: corrupt/unavailable cache treated as empty */ }
}

export function cacheMnemonics(data) {
  try { localStorage.setItem(KEYS.mnemonics, JSON.stringify(data)) } catch { /* best-effort: storage full/unavailable, cache write skipped */ }
}

export function getCachedMnemonics() {
  try {
    const raw = localStorage.getItem(KEYS.mnemonics)
    return raw ? JSON.parse(raw) : null
  } catch { return null /* best-effort: corrupt/unavailable cache treated as empty */ }
}

export function cacheSentProgress(data) {
  try { localStorage.setItem(KEYS.sentProgress, JSON.stringify(data)) } catch { /* best-effort: storage full/unavailable, cache write skipped */ }
}

export function getCachedSentProgress() {
  try {
    const raw = localStorage.getItem(KEYS.sentProgress)
    return raw ? JSON.parse(raw) : null
  } catch { return null /* best-effort: corrupt/unavailable cache treated as empty */ }
}

// --- Pending updates queue (for offline progress updates) ---

export function queueUpdate(update) {
  try {
    const raw = localStorage.getItem(KEYS.pendingUpdates)
    const queue = raw ? JSON.parse(raw) : []
    queue.push({ ...update, timestamp: Date.now() })
    localStorage.setItem(KEYS.pendingUpdates, JSON.stringify(queue))
  } catch { /* best-effort: storage full/unavailable, update dropped from offline queue */ }
}

export function getPendingUpdates() {
  try {
    const raw = localStorage.getItem(KEYS.pendingUpdates)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearPendingUpdates() {
  localStorage.removeItem(KEYS.pendingUpdates)
}
