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
 * Aligns non-punctuation words with pinyin tokens.
 */
function extractGapPinyin(words, fullPinyin, gapWord) {
  const punct = new Set(['。', '！', '？', '，', '、'])
  const contentWords = words.filter((w) => !punct.has(w))
  const gapIndex = contentWords.indexOf(gapWord)
  if (gapIndex === -1) return null

  // Split pinyin, strip trailing punctuation from tokens
  const pinyinTokens = fullPinyin
    .split(/\s+/)
    .map((t) => t.replace(/[。！？，、.!?,;]+$/, ''))
    .filter(Boolean)

  // Single-char words map 1:1; multi-char words may span multiple tokens
  let tokenIdx = 0
  for (let i = 0; i < contentWords.length && tokenIdx < pinyinTokens.length; i++) {
    const word = contentWords[i]
    // Estimate how many pinyin tokens this word uses (roughly 1 per character)
    const charCount = [...word].length
    const tokens = pinyinTokens.slice(tokenIdx, tokenIdx + charCount)

    if (i === gapIndex) {
      return tokens.join(' ').toLowerCase()
    }
    tokenIdx += charCount
  }
  return null
}

/**
 * Compare user gap answer to correct answer.
 * Accepts both Hanzi (exact match) and Pinyin (numbered or tone-marked).
 */
export function checkGapAnswer(userAnswer, correctWord, words, fullPinyin) {
  const user = userAnswer.trim()
  if (!user) return false

  // Hanzi exact match
  if (user === correctWord.trim()) return true

  // Try Pinyin match if sentence data is available
  if (words && fullPinyin) {
    const gapPinyin = extractGapPinyin(words, fullPinyin, correctWord)
    if (gapPinyin) {
      const userLower = user.toLowerCase()
        .replace(/v/g, 'ü')

      // Normalize tone-marked pinyin to numbered for comparison
      const toneCharMap = {}
      const toneMarks = {
        a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'],
        i: ['ī', 'í', 'ǐ', 'ì'], o: ['ō', 'ó', 'ǒ', 'ò'],
        u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
      }
      for (const [base, marks] of Object.entries(toneMarks)) {
        marks.forEach((mark, i) => { toneCharMap[mark] = { base, tone: i + 1 } })
      }

      const toNumbered = (s) => {
        let str = s.toLowerCase()
        let tone = 0
        for (let i = 0; i < str.length; i++) {
          const info = toneCharMap[str[i]]
          if (info) {
            str = str.slice(0, i) + info.base + str.slice(i + 1)
            tone = info.tone
            break
          }
        }
        // If already has trailing number, keep it
        if (/[0-5]$/.test(s)) return s.toLowerCase()
        return tone === 0 ? str : str + tone
      }

      const stripTone = (s) => s.replace(/[0-5]$/, '').toLowerCase()

      // Normalize both to numbered format for comparison
      const gapTokens = gapPinyin.split(' ')
      const userTokens = userLower.split(/\s+/)

      // Single token gap (e.g., bù / bu4 for 不)
      if (gapTokens.length === 1 && userTokens.length === 1) {
        const gapNum = toNumbered(gapTokens[0])
        const userNum = toNumbered(userTokens[0])
        // Exact pinyin+tone match
        if (gapNum === userNum) return true
        // Base match (ignore tone) – still accept
        if (stripTone(gapNum) === stripTone(userNum)) return true
      }

      // Multi-token gap (e.g., Zhōngguó = zhong1 guo2)
      if (gapTokens.length === userTokens.length) {
        const allMatch = gapTokens.every((gt, i) => {
          const gn = toNumbered(gt)
          const un = toNumbered(userTokens[i])
          return gn === un || stripTone(gn) === stripTone(un)
        })
        if (allMatch) return true
      }

      // Also try as single string without spaces (e.g., "zhongguo2" or "zhongguo")
      const gapJoined = gapTokens.map((t) => stripTone(toNumbered(t))).join('')
      const userJoined = userTokens.map((t) => stripTone(toNumbered(t))).join('')
      if (gapJoined === userJoined) return true
    }
  }

  return false
}

/**
 * Compare user translation. Flexible matching.
 */
export function checkTranslation(userChinese, correctChinese) {
  // Remove all whitespace and punctuation for comparison
  const normalize = (s) => s.replace(/[\s。！？，、.!?,]/g, '')
  return normalize(userChinese) === normalize(correctChinese)
}
