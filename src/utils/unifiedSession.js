/**
 * Build a unified learning session mixing characters and unlocked sentences.
 * Priority: due chars → due sentences → new chars (max 5) → new sentences (max 3) → not-due filler.
 * Total session size: 15 items.
 */

import { getUnlockedSentences } from './lessonUtils'

const SESSION_SIZE = 15
const MAX_NEW_CHARS = 5
const MAX_NEW_SENTENCES = 3

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

function getQuizType(type, level) {
  if (type === 'character') {
    switch (level) {
      case 0: return 'learn'
      case 1: return 'mc-meaning'
      case 2: return 'freetext'
      case 3: return 'mc-hanzi'
      default: return 'mc-meaning'
    }
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

  // Build session by priority
  const selected = []
  const add = (pool, max) => {
    const remaining = Math.min(max, SESSION_SIZE - selected.length)
    selected.push(...pool.slice(0, remaining))
  }

  add(dueChars, SESSION_SIZE)
  add(dueSents, SESSION_SIZE)
  add(newChars, MAX_NEW_CHARS)
  add(newSents, MAX_NEW_SENTENCES)
  add(notDueChars, SESSION_SIZE)
  add(notDueSents, SESSION_SIZE)

  return selected.slice(0, SESSION_SIZE).map(({ type, item, level }) => ({
    type,
    // Keep `character` / `sentence` keys for compatibility with QuizCard / SentenceQuizCard
    ...(type === 'character' ? { character: item } : { sentence: item }),
    quizType: getQuizType(type, level),
    level,
  }))
}
