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
 * Compare user gap answer to correct answer (case-insensitive, trimmed).
 */
export function checkGapAnswer(userAnswer, correctWord) {
  return userAnswer.trim() === correctWord.trim()
}

/**
 * Compare user translation. Flexible matching.
 */
export function checkTranslation(userChinese, correctChinese) {
  // Remove all whitespace and punctuation for comparison
  const normalize = (s) => s.replace(/[\s。！？，、.!?,]/g, '')
  return normalize(userChinese) === normalize(correctChinese)
}
