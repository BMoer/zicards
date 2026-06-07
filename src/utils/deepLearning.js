/**
 * Deep-Learning-Modus: gezieltes, bewusstes Vertiefen statt Quiz.
 *
 * Zwei Bausteine:
 *  - „schwierige Wörter": Zeichen, die der/die Lernende oft geübt, aber nicht
 *    verinnerlicht hat — dieselbe Definition wie die Lehreransicht
 *    (AdminUserDetail): mindestens DIFFICULT_MIN_PRACTICED Versuche und noch
 *    auf Level ≤ DIFFICULT_MAX_LEVEL.
 *  - Grammatikregeln (siehe data/sentenceGrammarRules.js) zum Auffrischen.
 *
 * Der Modus wird vom Dashboard aus proaktiv angeboten, sobald
 * DEEP_LEARNING_SESSION_THRESHOLD Übungsdurchläufe absolviert wurden.
 */

export const DIFFICULT_MIN_PRACTICED = 3
export const DIFFICULT_MAX_LEVEL = 1
export const DEEP_LEARNING_SESSION_THRESHOLD = 5

/**
 * Liefert die schwierigen Zeichen des/der Lernenden, schwerste zuerst.
 * @param {Array}  characters  alle Zeichen-Rows
 * @param {Object} charProgress map { characterId: progressRecord }
 * @returns {Array<{ char, progress }>}
 */
export function getDifficultChars(characters, charProgress) {
  if (!characters || !charProgress) return []
  const out = []
  for (const c of characters) {
    const p = charProgress[c.id]
    if (!p) continue
    const practiced = p.times_practiced || 0
    const level = p.level || 0
    if (practiced >= DIFFICULT_MIN_PRACTICED && level <= DIFFICULT_MAX_LEVEL) {
      out.push({ char: c, progress: p })
    }
  }
  // Schwerste zuerst: am häufigsten geübt und am niedrigsten im Level.
  out.sort((a, b) => {
    const byLevel = (a.progress.level || 0) - (b.progress.level || 0)
    if (byLevel !== 0) return byLevel
    return (b.progress.times_practiced || 0) - (a.progress.times_practiced || 0)
  })
  return out
}

/**
 * Soll der Deep-Learning-Modus proaktiv angeboten werden?
 * @param {number} completedSessions
 * @param {number} difficultCount
 */
export function shouldOfferDeepLearning(completedSessions, difficultCount) {
  return (
    (completedSessions || 0) >= DEEP_LEARNING_SESSION_THRESHOLD &&
    (difficultCount || 0) > 0
  )
}
