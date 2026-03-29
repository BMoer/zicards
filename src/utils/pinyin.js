// Tone mark mappings per vowel
const toneMarks = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

// Reverse map: tone char → base + tone number
const toneCharMap = {}
for (const [base, marks] of Object.entries(toneMarks)) {
  marks.forEach((mark, i) => {
    toneCharMap[mark] = { base, tone: i + 1 }
  })
}

/**
 * Find the vowel that should receive the tone mark.
 * Rules: a/e always get it; in "ou" it's "o"; otherwise last vowel.
 */
function findToneVowelIndex(syllable) {
  const lower = syllable.toLowerCase()
  // a and e always take the mark
  for (let i = 0; i < lower.length; i++) {
    if (lower[i] === 'a' || lower[i] === 'e') return i
  }
  // "ou" → tone on "o"
  const ouIdx = lower.indexOf('ou')
  if (ouIdx !== -1) return ouIdx
  // Otherwise last vowel
  const vowels = 'iouü'
  let lastIdx = -1
  for (let i = 0; i < lower.length; i++) {
    if (vowels.includes(lower[i])) lastIdx = i
  }
  return lastIdx
}

/**
 * Convert numbered pinyin (ma1) to tone-marked pinyin (mā)
 */
export function numberToToneMark(input) {
  if (!input) return ''
  const str = input.trim().toLowerCase()
  // Handle v as ü
  const withU = str.replace(/v/g, 'ü')

  const match = withU.match(/^([a-züü]+)([1-5])$/)
  if (!match) return input // return as-is if not numbered format

  const syllable = match[1]
  const tone = parseInt(match[2])

  if (tone === 5) return syllable // neutral tone, no mark

  const idx = findToneVowelIndex(syllable)
  if (idx === -1) return syllable

  const vowel = syllable[idx]
  const marks = toneMarks[vowel]
  if (!marks) return syllable

  return syllable.slice(0, idx) + marks[tone - 1] + syllable.slice(idx + 1)
}

/**
 * Convert tone-marked pinyin (mā) to numbered (ma1)
 */
export function toneMarkToNumber(input) {
  if (!input) return ''
  let str = input.trim()
  let tone = 5 // default neutral

  for (let i = 0; i < str.length; i++) {
    const info = toneCharMap[str[i]]
    if (info) {
      str = str.slice(0, i) + info.base + str.slice(i + 1)
      tone = info.tone
      break
    }
  }

  return tone === 5 ? str : str + tone
}

/**
 * Compare user input pinyin against correct pinyin_input (e.g. "ma1")
 * Accepts both numbered (ma1) and tone-marked (mā) format.
 */
export function comparePinyin(userInput, correctPinyinInput) {
  if (!userInput || !correctPinyinInput) return false
  const normalized = userInput.trim().toLowerCase().replace(/v/g, 'ü')
  const correct = correctPinyinInput.trim().toLowerCase()

  // Direct match with numbered format
  if (normalized === correct) return true

  // Convert user's tone marks to numbered and compare
  const asNumbered = toneMarkToNumber(normalized)
  if (asNumbered === correct) return true

  return false
}

/**
 * Compare user meaning input against correct meaning.
 * Case-insensitive, handles German articles.
 */
export function compareMeaning(userInput, correctMeaning) {
  if (!userInput || !correctMeaning) return false
  const user = userInput.trim().toLowerCase()
  const correct = correctMeaning.trim().toLowerCase()

  if (user === correct) return true

  // Check containment both ways
  if (user.includes(correct) || correct.includes(user)) return true

  // Strip common German articles
  const articles = ['der ', 'die ', 'das ', 'ein ', 'eine ', 'einen ', 'einem ', 'einer ']
  let userStripped = user
  let correctStripped = correct
  for (const art of articles) {
    if (userStripped.startsWith(art)) userStripped = userStripped.slice(art.length)
    if (correctStripped.startsWith(art)) correctStripped = correctStripped.slice(art.length)
  }

  if (userStripped === correctStripped) return true
  if (userStripped.includes(correctStripped) || correctStripped.includes(userStripped)) return true

  return false
}
