/**
 * Word-order quiz: detect what kind of mistake the user made so the
 * feedback can be specific instead of just "Nicht ganz".
 *
 * The most common case in our data is a single misplaced word (typically
 * an adverb like 都/也/还 that the user puts in the wrong slot). When that
 * happens we want to point at the exact word and look up a grammar rule.
 */

/**
 * If `user` and `correct` are permutations of each other AND differ only
 * by moving a single element, return { word, userIndex, correctIndex }.
 * Otherwise return null.
 *
 * O(n²) on word-count, fine for sentence-length arrays.
 */
export function findSingleMisplacement(user, correct) {
  if (!Array.isArray(user) || !Array.isArray(correct)) return null
  if (user.length !== correct.length || user.length < 2) return null

  // Same multiset?
  const sortedU = [...user].sort()
  const sortedC = [...correct].sort()
  for (let i = 0; i < sortedU.length; i++) {
    if (sortedU[i] !== sortedC[i]) return null
  }

  // Try every (i, j) pair: removing user[i] from user and correct[j] from
  // correct should yield identical sequences if exactly one element moved.
  for (let i = 0; i < user.length; i++) {
    for (let j = 0; j < correct.length; j++) {
      if (i === j) continue
      if (user[i] !== correct[j]) continue
      const um = [...user.slice(0, i), ...user.slice(i + 1)]
      const cm = [...correct.slice(0, j), ...correct.slice(j + 1)]
      if (um.every((w, k) => w === cm[k])) {
        return { word: user[i], userIndex: i, correctIndex: j }
      }
    }
  }
  return null
}
