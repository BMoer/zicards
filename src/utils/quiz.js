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

  // Deduplicate by field value
  const usedValues = new Set([correctChar[field]])
  const distractors = []
  for (const c of pool) {
    if (distractors.length >= 3) break
    if (!usedValues.has(c[field])) {
      usedValues.add(c[field])
      distractors.push({
        value: c[field],
        characterId: c.id,
        isCorrect: false,
      })
    }
  }

  const options = [
    { value: correctChar[field], characterId: correctChar.id, isCorrect: true },
    ...distractors,
  ]

  return shuffle(options)
}

/**
 * Build a learning session.
 * @param {array} characters - all characters (optionally filtered by week)
 * @param {object} progressMap - { characterId: progressRecord }
 * @returns {array} ordered array of { character, quizType, level }
 */
export function buildSession(characters, progressMap) {
  if (!characters || characters.length === 0) return []

  // Annotate each character with its progress
  const annotated = characters.map((char) => {
    const progress = progressMap[char.id]
    const level = progress ? progress.level : 0
    const lastPracticed = progress?.last_practiced
      ? new Date(progress.last_practiced).getTime()
      : 0
    return { character: char, level, lastPracticed }
  })

  // Sort: lowest level first, then oldest week, then longest since practiced
  annotated.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    if (a.character.week !== b.character.week) return a.character.week - b.character.week
    return a.lastPracticed - b.lastPracticed
  })

  // Split into new (level 0) and known
  const newChars = annotated.filter((a) => a.level === 0)
  const knownChars = annotated.filter((a) => a.level > 0)

  // Max 5 new, fill rest with known, total 15
  const selectedNew = newChars.slice(0, 5)
  const remaining = 15 - selectedNew.length
  const selectedKnown = knownChars.slice(0, remaining)

  const session = [...selectedNew, ...selectedKnown].slice(0, 15)

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
