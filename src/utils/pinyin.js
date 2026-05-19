/**
 * Pinyin utilities.
 *
 * The pre-pivot version of this file (~322 LOC) implemented tone-aware
 * answer grading: comparePinyin, isPinyinToneWrong, compareWordPinyin,
 * stripAllTones, compareMeaning, isMeaningClose, plus tone-mark ↔ number
 * conversions. All graded comparisons were removed when the app's learning
 * goal shifted to digital written communication: Pinyin is now only the
 * IME input method (see IMEInput.jsx), never a graded answer. Tone marks
 * are still displayed (read directly from `characters.pinyin`), so the
 * conversion helpers are no longer needed.
 *
 * What survives: shape predicates over a character row that other modules
 * use to decide which form to display.
 */

/**
 * True when the row's canonical word is the doubled form (e.g. 姐姐, 妈妈)
 * and `hanzi` holds only the bare single character. Used to render the
 * doubled form as the visual prompt.
 */
export function isDoubledWord(character) {
  if (!character?.word || !character?.hanzi) return false
  const chars = [...character.word]
  return chars.length === 2 && chars[0] === chars[1] && chars[0] === character.hanzi
}

/**
 * Characters whose default standalone Google-TTS reading differs from the
 * reading taught in this app's lesson context. For these we display + speak
 * the full compound word, so TTS pronounces the correct syllable.
 *
 * Example: 觉 reads as "jué" alone (觉得) but "jiào" in 睡觉 (Schlaf, Lektion
 * 6). Showing only 觉 and feeding it to TTS yields "jué", contradicting the
 * pinyin "jiào" shown on the card. Reported by Karl 2026-05-13.
 */
const AMBIGUOUS_STANDALONE_HANZI = new Set(['觉'])

export function hasAmbiguousStandaloneReading(character) {
  if (!character?.hanzi || !character?.word) return false
  if (character.hanzi === character.word) return false
  return AMBIGUOUS_STANDALONE_HANZI.has(character.hanzi)
}

/**
 * Characters where the German meaning belongs to the compound, not the
 * single character — quizzing the bare hanzi creates wrong-feeling cards
 * because the morpheme alone doesn't bear that meaning. Examples:
 *   昨 alone ≠ "gestern" (only 昨天 means "yesterday")
 *   明 alone ≠ "morgen" (明 = bright; 明天 = tomorrow)
 *   奥 alone ≠ "Österreich" (clipped form; 奥地利 is the country name)
 *
 * The 奥 case is already self-marked via the "in 奥地利:" prefix in the
 * meaning column, so we auto-detect that. For 昨/明 the meaning is just
 * the bare German word, so we maintain a curated set.
 *
 * Reported via screenshot feedback 2026-05-18.
 */
const COMPOUND_ONLY_MEANING_HANZI = new Set(['昨', '明'])
const MEANING_IN_COMPOUND_PREFIX = /^in\s+\S*[一-鿿]\S*\s*:/

export function hasCompoundOnlyMeaning(character) {
  if (!character?.hanzi || !character?.word) return false
  if (character.hanzi === character.word) return false
  if (COMPOUND_ONLY_MEANING_HANZI.has(character.hanzi)) return true
  if (character.meaning && MEANING_IN_COMPOUND_PREFIX.test(character.meaning)) return true
  return false
}

/**
 * The string that should be both *displayed* and *spoken* for a character row.
 * Single source of truth — used by every SpeakButton, autoSpeak, and visual
 * prompt to keep audio in sync with what the learner sees on screen.
 *
 * Fixes the long-standing bug where `character.word || character.hanzi`
 * caused the TTS to read the compound word (e.g. "shàngwǔ" for 上午) when
 * the card showed only the single char (上). Reported as
 * "Audio ist mehr als zeichen" / "Passt nicht mit Ton zusammen
 * unten/vormittag/nachmittag?" (2026-05-09).
 *
 * Also handles the inverse case: characters whose standalone TTS reading is
 * a different syllable than the lesson reading (e.g. 觉 → jué standalone,
 * jiào in 睡觉). For those we show + speak the compound so TTS is correct.
 */
export function displayHanzi(character) {
  if (!character) return ''
  if (usesCompoundForm(character)) return character.word
  return character.hanzi
}

/**
 * True when the card should present the compound form (word + pinyin_word)
 * as the primary prompt — either because the hanzi is the canonical doubled
 * form, or because its standalone TTS reading is ambiguous.
 */
export function usesCompoundForm(character) {
  return (
    isDoubledWord(character) ||
    hasAmbiguousStandaloneReading(character) ||
    hasCompoundOnlyMeaning(character)
  )
}

/**
 * The pinyin string that pairs with displayHanzi — pinyin_word when the
 * compound is shown, otherwise the bare char's pinyin.
 */
export function displayPinyin(character) {
  if (!character) return ''
  if (usesCompoundForm(character)) return character.pinyin_word || character.pinyin
  return character.pinyin
}

const HAN_RE = /[一-鿿]/

/**
 * The meaning string with all Chinese leaks removed — for use in MC quiz
 * prompts/options where seeing the answer hanzi inside the meaning text
 * makes the question trivial.
 *
 * Strips:
 *   • parenthesised groups containing any Hànzì:  "(奥地利)", "(in 德国)"
 *   • compound-prefix segments:                   "in 工作: …", "in 奥地利: …"
 *   • leftover trailing/leading punctuation
 *
 * Examples:
 *   "Österreich (奥地利)"               → "Österreich"
 *   "in 奥地利: Österreich"             → "Österreich"
 *   "Tugend; (in 德国) Deutschland"     → "Tugend; Deutschland"
 *   "Handwerk; in 工作: arbeiten"       → "Handwerk; arbeiten"
 *   "Pluralpartikel"                    → "Pluralpartikel"
 *
 * Reported via "trivial" feedback on /learn/1 (2026-05-10): when the MC
 * prompt contains the answer's hanzi as a parenthetical hint, the quiz
 * becomes a pattern-match instead of a recall test.
 */
export function meaningForQuiz(meaning) {
  if (!meaning) return ''
  let s = meaning
  // Remove parens that contain Chinese chars (keep parens with only Latin text).
  s = s.replace(/\s*\([^)]*\)/g, (m) => (HAN_RE.test(m) ? '' : m))
  // Remove "in <…hanzi…>: " segments anywhere in the string.
  s = s.replace(/in\s+\S*[一-鿿]\S*\s*:\s*/g, '')
  // Clean up dangling separators left behind by the removals.
  s = s.replace(/;\s*(?=,|;|$)/g, '')
  s = s.replace(/^\s*[,;]\s*/, '')
  s = s.replace(/\s*[,;]\s*$/, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}
