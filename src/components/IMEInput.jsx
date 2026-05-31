import { useState, useEffect, useRef, useMemo } from 'react'
import { getIMECandidates } from '../utils/imeCandidates'
import { extractDirectHanzi } from '../utils/directHanzi'
import { COMMON_CHARS } from '../data/commonCharacters'

/**
 * Pinyin IME input — mimics how Chinese is typed on a real digital keyboard.
 * User types pinyin (e.g. "hao") → candidate list of characters appears →
 * user clicks a candidate or presses 1-9 to select. The selected hanzi is
 * the answer; the parent decides whether it's correct.
 *
 * Direct Hànzì entry: if the field already contains Han characters (the user
 * typed them with their device's own Chinese keyboard / handwriting), we skip
 * the pinyin candidate list and let them commit those characters straight away
 * — the harder, no-elimination mode requested by Lukas Feuchter 2026-05-31.
 *
 * Props:
 *   curriculumChars   array of character rows from Supabase (primary candidates)
 *   expectedHanzi     the correct char — guaranteed to appear if it matches input
 *   onSelect(hanzi)   called when user picks a candidate
 *   disabled          when true, input + buttons locked
 *   selectedHanzi     parent-controlled selection (echo back what the user picked)
 *   placeholder       optional input placeholder (default: "Pinyin tippen…")
 *   autoFocus         default true
 */
export default function IMEInput({
  curriculumChars,
  expectedHanzi,
  onSelect,
  onEnter,
  disabled = false,
  selectedHanzi = null,
  placeholder = 'Pinyin tippen + wählen — oder Zeichen direkt eingeben',
  autoFocus = true,
}) {
  const [typed, setTyped] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus()
    }
  }, [autoFocus, disabled])

  // If the user typed Hànzì directly (device IME / handwriting), we bypass the
  // pinyin candidate list entirely and let them commit those characters.
  const directHanzi = useMemo(() => extractDirectHanzi(typed), [typed])
  const hasDirectHanzi = directHanzi.length > 0

  const candidates = useMemo(
    () =>
      hasDirectHanzi
        ? []
        : getIMECandidates(typed, curriculumChars, COMMON_CHARS, { expectedHanzi, max: 9 }),
    [typed, curriculumChars, expectedHanzi, hasDirectHanzi]
  )

  const handleSelect = (hanzi) => {
    if (disabled) return
    onSelect(hanzi)
    // Clear the pinyin buffer so the user can immediately type the next
    // character without manually erasing — matches how real Pinyin IMEs
    // (Sogou, iOS, etc.) reset after a commit.
    setTyped('')
    // Refocus the input so the mobile keyboard stays open for the next
    // character. Without this, picking a candidate dismisses the keyboard
    // and the user has to tap the input again on every word
    // (reported 2026-05-10).
    inputRef.current?.focus()
  }

  // Commit every directly-typed Hànzì in order, then reset like a candidate
  // pick would. Punctuation/pinyin already stripped by extractDirectHanzi.
  const commitDirect = () => {
    if (disabled || !hasDirectHanzi) return
    directHanzi.forEach((hanzi) => onSelect(hanzi))
    setTyped('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    // With Hànzì in the buffer, Enter/Space commit the typed characters rather
    // than picking a pinyin candidate or submitting the sequence. A second
    // Enter on an empty buffer then submits via onEnter, as usual.
    if (hasDirectHanzi) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        commitDirect()
      }
      return
    }
    // Enter submits the whole sequence ("Fertig"). Reserved for desktop
    // keyboard use — mobile users tap the button.
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault()
      onEnter()
      return
    }
    // Number-key shortcut (like a real IME): 1-9 picks the corresponding candidate
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= 9 && candidates[n - 1]) {
      e.preventDefault()
      handleSelect(candidates[n - 1].hanzi)
      return
    }
    // Space picks the first candidate (like real IMEs)
    if (e.key === ' ' && candidates[0]) {
      e.preventDefault()
      handleSelect(candidates[0].hanzi)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        // font-size:16px prevents iOS Safari/Firefox auto-zoom on focus
        style={{ fontSize: '16px' }}
        className="w-full px-4 py-3 border rounded-lg bg-white border-ink/20 focus:border-ink/40 focus:outline-none disabled:opacity-60"
      />

      {hasDirectHanzi && (
        <button
          type="button"
          onClick={commitDirect}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-ink rounded-lg bg-ink/5 hover:bg-ink/10 transition-colors disabled:opacity-60"
        >
          <span className="font-hanzi text-2xl">{directHanzi.join('')}</span>
          <span className="text-xs text-ink/50">direkt übernehmen ⏎</span>
        </button>
      )}

      {!hasDirectHanzi && typed && candidates.length === 0 && (
        <p className="text-sm text-ink/40 italic">
          Keine Zeichen gefunden für „{typed}". Anders tippen?
        </p>
      )}

      {candidates.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2" role="listbox">
          {candidates.map((c, i) => {
            const isSelected = selectedHanzi === c.hanzi
            const baseClass = 'flex items-baseline gap-2 px-3 py-3 border rounded-lg text-left transition-colors disabled:opacity-60'
            const stateClass = isSelected
              ? 'border-ink bg-ink/5'
              : 'border-ink/15 hover:border-ink/30 active:bg-ink/5'
            return (
              <button
                key={c.hanzi}
                type="button"
                onClick={() => handleSelect(c.hanzi)}
                disabled={disabled}
                className={`${baseClass} ${stateClass}`}
                aria-selected={isSelected}
              >
                <span className="text-xs text-ink/40 font-mono">{i + 1}</span>
                <span className="font-hanzi text-2xl">{c.hanzi}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
