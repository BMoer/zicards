/**
 * IME candidate-list builder.
 * Mirrors how a real Pinyin IME (Sogou, iOS Pinyin, …) ranks candidates:
 *   1. exact toneless-pinyin match comes before prefix matches
 *   2. inside each bucket, more frequent characters come first
 *   3. the curriculum char (`expectedHanzi`) is always present, but never
 *      first if other matches are more frequent — otherwise the answer
 *      would be giveaway
 *
 * Inputs:
 *   - typed:           what the user has typed so far ("ha", "hao", "hao3")
 *   - curriculumChars: rows from the `characters` table — primary candidates
 *   - commonChars:     COMMON_CHARS from src/data/commonCharacters.js
 *   - expectedHanzi:   the correct char the parent quiz is asking for
 *   - max:             max number of candidates to return (default 9)
 *
 * Output: ordered array of { hanzi, pinyin_input, source }
 *   source ∈ 'curriculum' | 'common' (UI may use to mark known chars)
 */

import { basePinyin } from '../data/commonCharacters'

function normalize(s) {
  if (!s) return ''
  return s.trim().toLowerCase().replace(/v/g, 'ü').replace(/\s+/g, '')
}

function freqOf(entry) {
  // curriculum chars: lower week → more "primary"; map to pseudo-freq.
  if (entry.source === 'curriculum') {
    const week = entry.week ?? 99
    return week * 100
  }
  return entry.freq ?? 9999
}

/**
 * Build the unified candidate pool from curriculum + common chars,
 * deduped by hanzi (curriculum entry wins on conflict).
 */
function buildPool(curriculumChars, commonChars) {
  const seen = new Set()
  const pool = []
  for (const c of curriculumChars || []) {
    if (!c.pinyin_input || !c.hanzi) continue
    // Skip multi-char compounds — IME picks single chars.
    if ([...c.hanzi].length !== 1) continue
    if (seen.has(c.hanzi)) continue
    seen.add(c.hanzi)
    pool.push({
      hanzi: c.hanzi,
      pinyin_input: c.pinyin_input.toLowerCase(),
      source: 'curriculum',
      week: c.week,
    })
  }
  for (const c of commonChars || []) {
    if (!c.pinyin_input || !c.hanzi) continue
    if (seen.has(c.hanzi)) continue
    seen.add(c.hanzi)
    pool.push({
      hanzi: c.hanzi,
      pinyin_input: c.pinyin_input.toLowerCase(),
      source: 'common',
      freq: c.freq,
    })
  }
  return pool
}

/**
 * Match an input against a candidate's pinyin_input.
 * Returns: 'exact' | 'prefix' | null
 *
 * - exact:  base pinyin matches typed input fully (typed='hao' vs 'hao3')
 * - prefix: typed input is a prefix of base ('ha' vs 'hao3')
 */
function matchType(typed, candidatePinyinInput) {
  const t = normalize(typed)
  if (!t) return null
  // Strip trailing tone digit if user typed one (rare in modern IMEs, but allowed)
  const tBase = t.replace(/[0-5]$/, '')
  const cBase = basePinyin(candidatePinyinInput)
  if (tBase === cBase) return 'exact'
  if (cBase.startsWith(tBase)) return 'prefix'
  return null
}

/**
 * Get IME candidates for a typed pinyin input.
 *
 * @param {string} typed
 * @param {Array} curriculumChars - rows from characters table
 * @param {Array} commonChars - COMMON_CHARS from src/data/commonCharacters.js
 * @param {object} opts
 * @param {string} [opts.expectedHanzi] - guarantee this char is included (if it matches)
 * @param {number} [opts.max=9]
 * @returns {Array<{hanzi, pinyin_input, source}>}
 */
export function getIMECandidates(typed, curriculumChars, commonChars, opts = {}) {
  const { expectedHanzi, max = 9 } = opts
  const t = normalize(typed)
  if (!t) return []

  const pool = buildPool(curriculumChars, commonChars)

  const exact = []
  const prefix = []
  for (const entry of pool) {
    const m = matchType(t, entry.pinyin_input)
    if (m === 'exact') exact.push(entry)
    else if (m === 'prefix') prefix.push(entry)
  }

  exact.sort((a, b) => freqOf(a) - freqOf(b))
  prefix.sort((a, b) => freqOf(a) - freqOf(b))

  let result = [...exact, ...prefix].slice(0, max)

  // Guarantee the expected character is in the list if it matches the input
  // at all — but never promote it past natural ordering.
  if (expectedHanzi && !result.some((c) => c.hanzi === expectedHanzi)) {
    const expected = pool.find((c) => c.hanzi === expectedHanzi)
    if (expected && matchType(t, expected.pinyin_input)) {
      // Replace last slot
      result = [...result.slice(0, max - 1), expected]
    }
  }

  return result
}
