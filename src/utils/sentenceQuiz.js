import { stripAllTones } from './pinyin'

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build a sentence learning session with spaced repetition.
 * Level 0 = show (learn), Level 1 = word order, Level 2 = fill gap, Level 3 = translate
 */
export function buildSentenceSession(sentences, progressMap) {
  if (!sentences || sentences.length === 0) return []

  const now = Date.now()

  const annotated = sentences.map((s) => {
    const p = progressMap[s.id]
    const level = p ? p.level : 0
    const lastPracticed = p?.last_practiced
      ? new Date(p.last_practiced).getTime()
      : 0
    const nextReview = p?.next_review
      ? new Date(p.next_review).getTime()
      : 0
    const isDue = level > 0 && nextReview <= now
    return { sentence: s, level, lastPracticed, nextReview, isDue }
  })

  const newOnes = annotated.filter((a) => a.level === 0)
  const due = annotated.filter((a) => a.isDue)
  const notDue = annotated.filter((a) => a.level > 0 && !a.isDue)

  due.sort((a, b) => a.nextReview - b.nextReview)
  newOnes.sort((a, b) => a.sentence.week - b.sentence.week)
  notDue.sort((a, b) => a.nextReview - b.nextReview)

  const selectedDue = due.slice(0, 10)
  const remaining1 = 10 - selectedDue.length
  const selectedNew = newOnes.slice(0, Math.min(3, remaining1))
  const remaining2 = 10 - selectedDue.length - selectedNew.length
  const selectedNotDue = notDue.slice(0, remaining2)

  const session = [...selectedDue, ...selectedNew, ...selectedNotDue].slice(0, 10)

  return session.map(({ sentence, level }) => {
    let quizType
    switch (level) {
      case 0: quizType = 'learn'; break
      case 1: quizType = 'order'; break
      case 2: quizType = 'gap'; break
      case 3: quizType = 'translate'; break
      default: quizType = 'order'
    }
    return { sentence, quizType, level }
  })
}

/**
 * Get shuffled words for a word-order exercise.
 * Excludes punctuation from draggable items, keeps them as fixed endings.
 */
export function getShuffledWords(words) {
  const punct = new Set(['。', '！', '？', '，', '、'])
  const draggable = words.filter((w) => !punct.has(w))
  const trailing = words.filter((w) => punct.has(w))
  return { shuffled: shuffle(draggable), trailing }
}

/**
 * Check if word order is correct.
 */
export function checkWordOrder(userOrder, correctWords) {
  const punct = new Set(['。', '！', '？', '，', '、'])
  const correctFiltered = correctWords.filter((w) => !punct.has(w))
  if (userOrder.length !== correctFiltered.length) return false
  return userOrder.every((w, i) => w === correctFiltered[i])
}

/**
 * Extract pinyin for a specific word from full sentence pinyin + words array.
 * Supports two tokenizations: one pinyin token per word (preferred)
 * or one per character. Always returns tone-marked pinyin joined by spaces
 * when the word spans multiple character-level tokens.
 */
function extractGapPinyin(words, fullPinyin, gapWord) {
  const punct = new Set(['。', '！', '？', '，', '、', '；', '：', '.', '!', '?', ',', ';', ':'])
  const contentWords = words.filter((w) => !punct.has(w))
  const gapIndex = contentWords.indexOf(gapWord)
  if (gapIndex === -1) return null

  const pinyinTokens = fullPinyin
    .split(/\s+/)
    .map((t) => t.replace(/[。！？，、；：.!?,;:]+$/, ''))
    .filter(Boolean)

  if (pinyinTokens.length === contentWords.length) {
    return pinyinTokens[gapIndex].toLowerCase()
  }

  const totalChars = contentWords.reduce((sum, w) => sum + [...w].length, 0)
  if (pinyinTokens.length === totalChars) {
    let tokenIdx = 0
    for (let i = 0; i < contentWords.length; i++) {
      const charCount = [...contentWords[i]].length
      if (i === gapIndex) {
        return pinyinTokens.slice(tokenIdx, tokenIdx + charCount).join(' ').toLowerCase()
      }
      tokenIdx += charCount
    }
  }

  return null
}

/**
 * Compare user gap answer to correct answer.
 * Accepts both Hanzi (exact match) and Pinyin in any form
 * (numbered `zhong1 guo2`, tone-marked `zhōngguó`, toneless `zhongguo`).
 */
export function checkGapAnswer(userAnswer, correctWord, words, fullPinyin) {
  const user = userAnswer.trim()
  if (!user) return false

  if (user === correctWord.trim()) return true

  if (words && fullPinyin) {
    const gapPinyin = extractGapPinyin(words, fullPinyin, correctWord)
    if (gapPinyin) {
      return stripAllTones(user) === stripAllTones(gapPinyin)
    }
  }

  return false
}

/**
 * Compare user translation. Accepts Hanzi or Pinyin (numbered or tone-marked).
 */
export function checkTranslation(userInput, correctChinese, correctPinyin) {
  const normalize = (s) => s.replace(/[\s。！？，、.!?,;：""'']/g, '')
  const userNorm = normalize(userInput.trim())
  if (!userNorm) return false

  // Hanzi exact match
  if (userNorm === normalize(correctChinese)) return true

  // Pinyin match
  if (correctPinyin) {
    const toneCharMap = {}
    const toneMarks = {
      a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'],
      i: ['ī', 'í', 'ǐ', 'ì'], o: ['ō', 'ó', 'ǒ', 'ò'],
      u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    }
    for (const [base, marks] of Object.entries(toneMarks)) {
      marks.forEach((mark, i) => { toneCharMap[mark] = { base, tone: i + 1 } })
    }

    const stripTones = (s) => {
      let result = s.toLowerCase().replace(/v/g, 'ü')
      for (const [mark, info] of Object.entries(toneCharMap)) {
        result = result.replace(new RegExp(mark, 'g'), info.base)
      }
      return result.replace(/[0-5]/g, '').replace(/[\s。！？，、.!?,;]+/g, '')
    }

    // Compare stripped pinyin (no tones, no spaces, no punctuation)
    if (stripTones(userNorm) === stripTones(correctPinyin)) return true
  }

  return false
}
