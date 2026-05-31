/**
 * Direct-Hànzì input support.
 *
 * The app's IME normally takes pinyin and lets the learner pick a character
 * from a candidate list. Power users typing on a device that already has a
 * Chinese keyboard / handwriting input want to enter the Hànzì straight away
 * instead of round-tripping through pinyin — it's the harder, more realistic
 * mode because there's no candidate list to eliminate against (feature
 * request, Lukas Feuchter 2026-05-31).
 *
 * These helpers detect Han characters in raw input so IMEInput can offer a
 * "commit directly" path. Latin pinyin, punctuation and whitespace are
 * dropped — only the CJK ideographs are committed, matching how the pinyin
 * picker only ever yields single Hànzì.
 */

const HAN = /\p{Script=Han}/u

export function isHanChar(ch) {
  return HAN.test(ch)
}

/**
 * Extract the Han characters from a directly-typed string, in order.
 * @param {string} typed
 * @returns {string[]} the Hànzì, punctuation/latin/whitespace removed
 */
export function extractDirectHanzi(typed) {
  if (!typed) return []
  return [...typed].filter(isHanChar)
}
