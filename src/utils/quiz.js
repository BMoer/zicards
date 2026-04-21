import { isDoubledWord } from './pinyin'

/**
 * Display value for the `hanzi` field: doubled words (姐姐) instead of the
 * bare single character when applicable.
 */
function hanziValue(character) {
  return isDoubledWord(character) ? character.word : character.hanzi
}

/**
 * Shuffle an array (Fisher-Yates)
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
 * Generate 4 MC options: 1 correct + 3 distractors.
 * Prefers same-week characters, fills from others if needed.
 * @param {object} correctChar - the correct character object
 * @param {array} allCharacters - all available characters
 * @param {string} field - 'meaning' (Stufe 1) or 'hanzi' (Stufe 3)
 * @returns {array} shuffled array of { value, characterId, isCorrect }
 */
export function generateMCOptions(correctChar, allCharacters, field) {
  const others = allCharacters.filter((c) => c.id !== correctChar.id)

  // Prefer same week
  const sameWeek = others.filter((c) => c.week === correctChar.week)
  const otherWeeks = others.filter((c) => c.week !== correctChar.week)

  // Pick distractors: same week first, then others
  const pool = [...shuffle(sameWeek), ...shuffle(otherWeeks)]

  const valueFor = (c) => (field === 'hanzi' ? hanziValue(c) : c[field])

  // Deduplicate by displayed value
  const usedValues = new Set([valueFor(correctChar)])
  const distractors = []
  for (const c of pool) {
    if (distractors.length >= 3) break
    const v = valueFor(c)
    if (!usedValues.has(v)) {
      usedValues.add(v)
      distractors.push({
        value: v,
        characterId: c.id,
        isCorrect: false,
      })
    }
  }

  const options = [
    { value: valueFor(correctChar), characterId: correctChar.id, isCorrect: true },
    ...distractors,
  ]

  return shuffle(options)
}

/**
 * Build a learning session with spaced repetition priority.
 * Due cards come first, then new cards, then not-yet-due cards.
 * @param {array} characters - all characters (optionally filtered by week)
 * @param {object} progressMap - { characterId: progressRecord }
 * @returns {array} ordered array of { character, quizType, level }
 */
export function buildSession(characters, progressMap) {
  if (!characters || characters.length === 0) return []

  const now = Date.now()

  // Annotate each character with its progress
  const annotated = characters.map((char) => {
    const progress = progressMap[char.id]
    const level = progress ? progress.level : 0
    const lastPracticed = progress?.last_practiced
      ? new Date(progress.last_practiced).getTime()
      : 0
    const nextReview = progress?.next_review
      ? new Date(progress.next_review).getTime()
      : 0
    const isDue = level > 0 && nextReview <= now
    return { character: char, level, lastPracticed, nextReview, isDue }
  })

  // Split into: new (level 0), due (needs review), and not-due
  const newChars = annotated.filter((a) => a.level === 0)
  const dueChars = annotated.filter((a) => a.isDue)
  const notDueChars = annotated.filter((a) => a.level > 0 && !a.isDue)

  // Sort due by most overdue first
  dueChars.sort((a, b) => a.nextReview - b.nextReview)
  // Sort new by week
  newChars.sort((a, b) => a.character.week - b.character.week)
  // Sort not-due by soonest upcoming review
  notDueChars.sort((a, b) => a.nextReview - b.nextReview)

  // Build session: due first, then new (max 5), fill rest with not-due, total 15
  const selectedDue = dueChars.slice(0, 15)
  const remaining1 = 15 - selectedDue.length
  const selectedNew = newChars.slice(0, Math.min(5, remaining1))
  const remaining2 = 15 - selectedDue.length - selectedNew.length
  const selectedNotDue = notDueChars.slice(0, remaining2)

  const session = [...selectedDue, ...selectedNew, ...selectedNotDue].slice(0, 15)

  // Map to quiz types
  return session.map(({ character, level }) => {
    let quizType
    switch (level) {
      case 0:
        quizType = 'learn'
        break
      case 1:
        quizType = 'mc-meaning'
        break
      case 2:
        quizType = 'freetext'
        break
      case 3:
        quizType = 'mc-hanzi'
        break
      default:
        quizType = 'mc-meaning'
    }
    return { character, quizType, level }
  })
}
