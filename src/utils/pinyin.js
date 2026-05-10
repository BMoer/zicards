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
 * The string that should be both *displayed* and *spoken* for a character row.
 * Single source of truth — used by every SpeakButton, autoSpeak, and visual
 * prompt to keep audio in sync with what the learner sees on screen.
 *
 * Fixes the long-standing bug where `character.word || character.hanzi`
 * caused the TTS to read the compound word (e.g. "shàngwǔ" for 上午) when
 * the card showed only the single char (上). Reported as
 * "Audio ist mehr als zeichen" / "Passt nicht mit Ton zusammen
 * unten/vormittag/nachmittag?" (2026-05-09).
 */
export function displayHanzi(character) {
  if (!character) return ''
  return isDoubledWord(character) ? character.word : character.hanzi
}
