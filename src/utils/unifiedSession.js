/**
 * Build a unified learning session mixing characters and unlocked sentences.
 * Priority: due chars → due sentences → new chars (max 5) → new sentences (max 3) → not-due filler.
 * Total session size: 15 items.
 */

import { getUnlockedSentences } from './lessonUtils'

const SESSION_SIZE = 15
const MAX_NEW_CHARS = 5
const MAX_NEW_SENTENCES = 3
// Reserve a minimum number of sentence slots so a power user — whose char
// queue is dense with not-due reviews — never gets a session of pure chars
// while sentences are sitting in the (lower-priority) not-due bucket.
// Reported 2026-05-11: "Lektion 1 vorausgewählt, keine Sätze zum üben".
const MIN_SENTS_PER_SESSION = 4

function annotateCharacter(char, progressMap) {
  const p = progressMap[char.id]
  const level = p ? p.level : 0
  const nextReview = p?.next_review ? new Date(p.next_review).getTime() : 0
  const isDue = level > 0 && nextReview <= Date.now()
  return { type: 'character', item: char, level, nextReview, isDue }
}

function annotateSentence(sentence, progressMap) {
  const p = progressMap[sentence.id]
  const level = p ? p.level : 0
  const nextReview = p?.next_review ? new Date(p.next_review).getTime() : 0
  const isDue = level > 0 && nextReview <= Date.now()
  return { type: 'sentence', item: sentence, level, nextReview, isDue }
}

const SENTENCE_PUNCT = new Set([
  '。', '！', '？', '，', '、', '：', '；',
  '.', '!', '?', ',', ';', ':',
])

function contentWordCount(sentence) {
  if (!sentence?.words) return 0
  return sentence.words.filter((w) => !SENTENCE_PUNCT.has(w)).length
}

function getQuizType(type, level, item) {
  if (type === 'character') {
    switch (level) {
      case 0: return 'learn'
      case 1: return 'mc-meaning'
      case 2: return 'mc-hanzi'
      case 3: return 'ime'
      default: return 'mc-meaning'
    }
  }
  // Sentences with only a single content word (e.g. 晚安!) collapse all
  // non-learn quiz types into the same task: type that one word via IME.
  // L1 order would be a single button to tap, and L2 gap would need a
  // gap_word that doesn't exist — so any post-learn level becomes
  // translate. Reported 2026-05-10.
  if (level > 0 && contentWordCount(item) <= 1) {
    return 'translate'
  }
  // sentence
  switch (level) {
    case 0: return 'learn'
    case 1: return 'order'
    case 2: return 'gap'
    case 3: return 'translate'
    default: return 'order'
  }
}

export function buildUnifiedSession(characters, charProgress, sentences, sentenceProgress) {
  if (!characters?.length) return []

  const unlocked = getUnlockedSentences(sentences || [], characters, charProgress)

  const chars = characters.map((c) => annotateCharacter(c, charProgress))
  const sents = unlocked.map((s) => annotateSentence(s, sentenceProgress))

  // Split by status
  const dueChars = chars.filter((a) => a.isDue).sort((a, b) => a.nextReview - b.nextReview)
  const dueSents = sents.filter((a) => a.isDue).sort((a, b) => a.nextReview - b.nextReview)
  const newChars = chars.filter((a) => a.level === 0).sort((a, b) => a.item.week - b.item.week)
  const newSents = sents.filter((a) => a.level === 0).sort((a, b) => a.item.week - b.item.week)
  const notDueChars = chars.filter((a) => a.level > 0 && !a.isDue).sort((a, b) => a.nextReview - b.nextReview)
  const notDueSents = sents.filter((a) => a.level > 0 && !a.isDue).sort((a, b) => a.nextReview - b.nextReview)

  // Build session by priority. Chars share a budget that leaves at least
  // MIN_SENTS_PER_SESSION slots for sentences when any sentences are
  // available — without this cap, a saturated not-due char queue silently
  // crowds out the entire sentence queue.
  const selected = []
  const targetSents = Math.min(MIN_SENTS_PER_SESSION, sents.length)
  const charBudget = SESSION_SIZE - targetSents
  let charsSelected = 0

  const addChars = (pool, max) => {
    const remaining = Math.min(
      max,
      SESSION_SIZE - selected.length,
      charBudget - charsSelected
    )
    if (remaining <= 0) return
    const picked = pool.slice(0, remaining)
    selected.push(...picked)
    charsSelected += picked.length
  }

  const addSents = (pool, max) => {
    const remaining = Math.min(max, SESSION_SIZE - selected.length)
    if (remaining <= 0) return
    selected.push(...pool.slice(0, remaining))
  }

  addChars(dueChars, SESSION_SIZE)
  addSents(dueSents, SESSION_SIZE)
  addChars(newChars, MAX_NEW_CHARS)
  addSents(newSents, MAX_NEW_SENTENCES)
  addChars(notDueChars, SESSION_SIZE)
  addSents(notDueSents, SESSION_SIZE)

  return selected.slice(0, SESSION_SIZE).map(({ type, item, level }) => ({
    type,
    // Keep `character` / `sentence` keys for compatibility with QuizCard / SentenceQuizCard
    ...(type === 'character' ? { character: item } : { sentence: item }),
    quizType: getQuizType(type, level, item),
    level,
  }))
}
