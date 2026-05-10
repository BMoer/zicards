/**
 * Sentence ↔ Character gating logic — "1T" rule (one-T, one new item).
 *
 * A sentence unlocks when at most ONE of its constituent characters is still
 * unknown (level 0 or no progress). All others must be at level >= 1
 * ("introduced" — answered correctly at least once). Comes from the SLA /
 * extensive-reading consensus (Spoonfed, Refold, Krashen i+1, ER 95% rule):
 * a sentence is most useful when it has exactly one new piece in a known
 * context, not when every character is mastered.
 *
 * Replaces the prior gate ("all characters at level >= 2") which kept users
 * out of sentence practice for far too long — confirmed by feedback
 * "wir sollten mehr Sätze machen, die Zeichen lernt man dann eh mit"
 * (2026-05-09) and stats showing 4/11 users had char progress but 0
 * sentence progress under the old gate.
 */

const KNOWN_LEVEL = 1 // level threshold for a char to count as "known"
const MAX_UNKNOWN = 1 // 1T rule: at most one unknown char per sentence

const PUNCT = new Set(['。', '！', '？', '，', '、', '：', '\u201c', '\u201d', '\u2018', '\u2019'])

/**
 * Build a lookup from hanzi → character object for fast matching.
 * Compound rows (hanzi="多少") are also indexed by their component characters
 * so sentences referencing 多 or 少 can find the compound row.
 */
function buildHanziMap(characters) {
  const map = {}
  // First pass: index by full hanzi (single chars and compounds).
  for (const c of characters) {
    map[c.hanzi] = c
  }
  // Second pass: index components of compounds, but never overwrite a
  // dedicated single-char row.
  for (const c of characters) {
    const chars = [...c.hanzi]
    if (chars.length <= 1) continue
    for (const ch of chars) {
      if (!map[ch]) map[ch] = c
    }
  }
  return map
}

/**
 * Get the character IDs that a sentence depends on.
 * Returns only characters that exist in the characters table.
 */
export function getSentenceCharIds(sentence, hanziMap) {
  const charIds = []
  for (const word of sentence.words) {
    if (PUNCT.has(word)) continue
    // A word may be multi-character — check each character
    for (const ch of word) {
      if (PUNCT.has(ch)) continue
      const charObj = hanziMap[ch]
      if (charObj) charIds.push(charObj.id)
    }
  }
  return [...new Set(charIds)]
}

/**
 * Count chars in a sentence that are still unknown (level 0 / no progress).
 */
function countUnknownChars(charIds, charProgress) {
  return charIds.filter((id) => {
    const p = charProgress[id]
    return !p || p.level < KNOWN_LEVEL
  }).length
}

/**
 * Check if a sentence is unlocked under the 1T rule.
 * Unlocked = at most MAX_UNKNOWN chars are unknown (level < 1).
 */
export function isSentenceUnlocked(sentence, hanziMap, charProgress) {
  const charIds = getSentenceCharIds(sentence, hanziMap)
  if (charIds.length === 0) return true // no matching chars → unlocked by default
  return countUnknownChars(charIds, charProgress) <= MAX_UNKNOWN
}

/**
 * For a locked sentence, return how many chars *beyond* the 1T allowance
 * are still missing. 0 = unlocked, 1+ = how many more to learn before unlock.
 */
export function getMissingCharCount(sentence, hanziMap, charProgress) {
  const charIds = getSentenceCharIds(sentence, hanziMap)
  const unknown = countUnknownChars(charIds, charProgress)
  return Math.max(0, unknown - MAX_UNKNOWN)
}

/**
 * Filter sentences to only those that are unlocked.
 */
export function getUnlockedSentences(sentences, characters, charProgress) {
  const hanziMap = buildHanziMap(characters)
  return sentences.filter((s) => isSentenceUnlocked(s, hanziMap, charProgress))
}

export { buildHanziMap }
