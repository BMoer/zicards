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
  for (let i = 0; i < lower.length; i++) {
    if (lower[i] === 'a' || lower[i] === 'e') return i
  }
  const ouIdx = lower.indexOf('ou')
  if (ouIdx !== -1) return ouIdx
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
  const withU = str.replace(/v/g, 'ü')

  const match = withU.match(/^([a-züü]+)([0-5])$/)
  if (!match) return input

  const syllable = match[1]
  const tone = parseInt(match[2])

  if (tone === 0 || tone === 5) return syllable // neutral tone, no mark

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
  let tone = 0 // default neutral

  for (let i = 0; i < str.length; i++) {
    const info = toneCharMap[str[i]]
    if (info) {
      str = str.slice(0, i) + info.base + str.slice(i + 1)
      tone = info.tone
      break
    }
  }

  return tone === 0 ? str : str + tone
}

/**
 * Extract the base syllable (without tone) from any pinyin format.
 * "ma1" → "ma", "mā" → "ma", "ma" → "ma", "ma0" → "ma"
 */
export function getPinyinBase(input) {
  if (!input) return ''
  let str = input.trim().toLowerCase().replace(/v/g, 'ü')

  // Strip trailing tone number
  str = str.replace(/[0-5]$/, '')

  // Replace tone-marked vowels with base
  for (let i = 0; i < str.length; i++) {
    const info = toneCharMap[str[i]]
    if (info) {
      str = str.slice(0, i) + info.base + str.slice(i + 1)
    }
  }

  return str
}

/**
 * Compare user input pinyin against correct pinyin_input (e.g. "ma1")
 * Accepts both numbered (ma1) and tone-marked (mā) format.
 * Also handles neutral tone: "ma" matches "ma0", "ma5", or "ma"
 */
export function comparePinyin(userInput, correctPinyinInput) {
  if (!userInput || !correctPinyinInput) return false
  const normalized = userInput.trim().toLowerCase().replace(/v/g, 'ü')
  const correct = correctPinyinInput.trim().toLowerCase()

  // Direct match
  if (normalized === correct) return true

  // Convert user's tone marks to numbered and compare
  const asNumbered = toneMarkToNumber(normalized)
  if (asNumbered === correct) return true

  // Handle neutral tone: "ma" = "ma0" = "ma5"
  const correctBase = correct.replace(/[05]$/, '')
  const isNeutral = correct.endsWith('0') || correct.endsWith('5')

  if (isNeutral) {
    // User typed just the base (e.g. "ma" for "ma0")
    if (normalized === correctBase) return true
    if (asNumbered === correctBase) return true
    // User typed with 5 instead of 0 or vice versa
    if (normalized === correctBase + '5' || normalized === correctBase + '0') return true
  }

  return false
}

/**
 * Check if only the tone is wrong (base syllable matches).
 * Returns true if base matches but full pinyin doesn't.
 */
export function isPinyinToneWrong(userInput, correctPinyinInput) {
  if (!userInput || !correctPinyinInput) return false
  // If fully correct, tone is not wrong
  if (comparePinyin(userInput, correctPinyinInput)) return false
  // Compare bases
  return getPinyinBase(userInput) === getPinyinBase(correctPinyinInput)
}

/**
 * Compare user meaning input against correct meaning.
 * Case-insensitive, handles German articles, parentheticals, flexible matching.
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

  // Strip parenthetical content: "Sie (Höflichkeitsform)" → "Sie"
  const stripParens = (s) => s.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const correctNoParens = stripParens(correctStripped)
  const userNoParens = stripParens(userStripped)

  if (userNoParens === correctNoParens) return true
  if (userNoParens.includes(correctNoParens) || correctNoParens.includes(userNoParens)) return true

  // Word-level matching: if all user words appear in the correct meaning (or vice versa)
  const userWords = userNoParens.split(/[\s,;/]+/).filter(Boolean)
  const correctWords = correctNoParens.split(/[\s,;/]+/).filter(Boolean)

  // All user words found in correct (or contained in a correct word)
  const allUserInCorrect = userWords.every((uw) =>
    correctWords.some((cw) => cw.includes(uw) || uw.includes(cw))
  )
  if (allUserInCorrect && userWords.length > 0) return true

  // All correct words found in user
  const allCorrectInUser = correctWords.every((cw) =>
    userWords.some((uw) => uw.includes(cw) || cw.includes(uw))
  )
  if (allCorrectInUser && correctWords.length > 0) return true

  return false
}
