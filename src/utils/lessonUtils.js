/**
 * Sentence ↔ Character gating logic.
 * A sentence is "unlocked" when all its non-punctuation words
 * have a matching character at level >= 2 in the user's progress.
 */

const PUNCT = new Set(['。', '！', '？', '，', '、', '：', '\u201c', '\u201d', '\u2018', '\u2019'])

/**
 * Build a lookup from hanzi → character object for fast matching.
 */
function buildHanziMap(characters) {
  const map = {}
  for (const c of characters) {
    map[c.hanzi] = c
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
 * Check if a sentence is unlocked based on character progress.
 * Unlocked = all matching characters are at level >= 2.
 */
export function isSentenceUnlocked(sentence, hanziMap, charProgress) {
  const charIds = getSentenceCharIds(sentence, hanziMap)
  if (charIds.length === 0) return true // no matching chars → unlocked by default
  return charIds.every((id) => {
    const p = charProgress[id]
    return p && p.level >= 2
  })
}

/**
 * For a locked sentence, return the count of characters still needed.
 */
export function getMissingCharCount(sentence, hanziMap, charProgress) {
  const charIds = getSentenceCharIds(sentence, hanziMap)
  return charIds.filter((id) => {
    const p = charProgress[id]
    return !p || p.level < 2
  }).length
}

/**
 * Filter sentences to only those that are unlocked.
 */
export function getUnlockedSentences(sentences, characters, charProgress) {
  const hanziMap = buildHanziMap(characters)
  return sentences.filter((s) => isSentenceUnlocked(s, hanziMap, charProgress))
}

export { buildHanziMap }
