/**
 * Sentence quiz: session builder + answer checkers.
 *
 * Pinyin is no longer accepted as an answer — the learning goal is digital
 * written communication, so all production-style quizzes (gap, translate)
 * require the actual Hànzì, produced via the IME picker. Pinyin is only used
 * as the *input method* in the picker, never as a graded answer.
 */

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
 * Level 0 = show (learn), Level 1 = word order, Level 2 = fill gap (IME),
 * Level 3 = translate (IME).
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
 * Locate the span of `words` tokens that together spell `gapWord`.
 *
 * `gap_word` is a *semantic* word (词典, 全班) while `words` may tokenise it as
 * one entry (照片, 我们) OR split it across single-char tokens (全 + 班).
 * Returns an inclusive { start, end } over `words`, or null when the gap word
 * can't be located.
 *
 * Why this exists: GapCard previously did `words.indexOf(gap_word)`, which
 * returns -1 for the split case (gap_word '全班' vs words ['全','班']). With
 * gapIndex === -1 no token was ever replaced by a blank, so the FULL sentence
 * rendered and handed the learner the answer — reported "Aufgabe ist verbuggt
 * … voller Satz steht bereits dort" (2026-05-23).
 */
export function findGapSpan(words, gapWord) {
  if (!Array.isArray(words) || !gapWord) return null
  const single = words.indexOf(gapWord)
  if (single !== -1) return { start: single, end: single }
  // Multi-token: find the contiguous run whose concatenation equals gapWord.
  for (let i = 0; i < words.length; i++) {
    let acc = ''
    for (let j = i; j < words.length; j++) {
      acc += words[j]
      if (acc === gapWord) return { start: i, end: j }
      if (!gapWord.startsWith(acc)) break // prune: this start can't reach gapWord
    }
  }
  return null
}

/**
 * Compare user gap answer to correct word — Hànzì only (exact match).
 * The IME picker produces Hànzì strings; pinyin is the input method,
 * never the graded answer.
 */
export function checkGapAnswer(userAnswer, correctWord) {
  const user = (userAnswer ?? '').trim()
  if (!user) return false
  return user === correctWord.trim()
}

const NORMALIZE_STRIP = /[\s。！？，、.!?,;：；""''《》「」]/g

/**
 * Compare user translation — Hànzì only.
 * Normalises away whitespace and punctuation on both sides; otherwise
 * exact-match.
 */
export function checkTranslation(userInput, correctChinese) {
  const norm = (s) => (s ?? '').replace(NORMALIZE_STRIP, '')
  const user = norm(userInput)
  if (!user) return false
  return user === norm(correctChinese)
}
