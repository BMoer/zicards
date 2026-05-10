import { useState, useMemo } from 'react'
import IMEInput from './IMEInput'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'

const PUNCT = new Set(['。', '！', '？', '，', '、', '：', '；', '"', '"', "'", "'", '.', '!', '?', ',', ';', ':'])

/**
 * Multi-character IME picker.
 * User types pinyin and picks Hànzì, building a sequence one character
 * at a time. The picked sequence is only checked when the user explicitly
 * presses "Fertig" — we never reveal how many characters are still
 * expected, because in real-world German→Chinese typing the learner
 * doesn't know the target length either ("ist nicht realistisch, weil
 * eigentlich weiß ich ja nicht ob ein satz vorbei ist oder nicht",
 * 2026-05-10).
 *
 * Props:
 *   expectedSequence - string of hànzì OR array (sentence words). Punctuation
 *                      is stripped from comparison and re-added in the
 *                      reveal display.
 *   curriculumChars  - characters table rows; used both as IME candidates
 *                      and to look up meanings of mis-picks.
 *   onComplete(ok)   - called once when the user submits.
 *   disabled
 */
export default function IMESequenceInput({
  expectedSequence,
  curriculumChars,
  mnemonics = null,
  progress = null,
  onComplete,
  disabled = false,
  hintAudioText = null,
}) {
  const expectedChars = useMemo(
    () =>
      Array.isArray(expectedSequence)
        ? expectedSequence.flatMap((w) => [...w])
        : [...expectedSequence],
    [expectedSequence]
  )
  const expectedPickChars = useMemo(
    () => expectedChars.filter((c) => !PUNCT.has(c)),
    [expectedChars]
  )

  const [picked, setPicked] = useState([]) // array of hànzì the user has chosen
  const [submitted, setSubmitted] = useState(null) // { correct } | null

  const done = submitted !== null

  const handleSelect = (hanzi) => {
    if (done || disabled) return
    setPicked((prev) => [...prev, hanzi])
  }

  const handleUndo = () => {
    if (done || disabled) return
    setPicked((prev) => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (done || disabled || picked.length === 0) return
    const correct =
      picked.length === expectedPickChars.length &&
      picked.every((p, i) => p === expectedPickChars[i])
    setSubmitted({ correct })
    onComplete(correct)
  }

  // Look up meaning of a hanzi from curriculumChars (search both single
  // chars and components of compound rows).
  const meaningOf = (hanzi) => {
    if (!curriculumChars) return null
    const exact = curriculumChars.find((c) => c.hanzi === hanzi)
    if (exact) return exact.meaning
    // For chars buried inside a compound row, fall back to the compound's
    // meaning rather than nothing — better than silence.
    const inCompound = curriculumChars.find(
      (c) => [...c.hanzi].includes(hanzi)
    )
    return inCompound?.meaning ?? null
  }

  // Build a per-position view of what was picked vs expected, for the
  // post-submit reveal.
  const pickReview = submitted
    ? picked.map((p, i) => ({
        hanzi: p,
        expected: expectedPickChars[i],
        ok: p === expectedPickChars[i],
        meaning: meaningOf(p),
      }))
    : null

  // Did the user fall short? Extra expected positions to reveal.
  const missingTail =
    submitted && expectedPickChars.length > picked.length
      ? expectedPickChars.slice(picked.length)
      : []

  return (
    <div className="space-y-4">
      {/* Live picked-so-far display. No placeholder underscores —
          showing them would leak the target length. */}
      <div className="font-hanzi text-3xl text-center min-h-[1.4em] leading-relaxed">
        {!done && picked.length === 0 && (
          <span className="text-ink/25 text-base italic">…</span>
        )}
        {!done && picked.map((c, i) => <span key={i}>{c}</span>)}
        {!done && picked.length > 0 && (
          <span className="text-ink/30 text-2xl ml-1">|</span>
        )}

        {done && pickReview.map((p, i) => (
          <span
            key={i}
            className={p.ok ? 'text-sage' : 'text-terracotta'}
          >
            {p.hanzi}
          </span>
        ))}
        {done && missingTail.length > 0 && (
          <span className="text-ink/30 ml-2">
            …{missingTail.join('')}
          </span>
        )}
      </div>

      {done && !submitted.correct && pickReview && (
        <div className="text-sm text-center space-y-1">
          <div className="text-ink/50">
            Erwartet:{' '}
            <span className="font-hanzi text-base text-sage">
              {expectedPickChars.join('')}
            </span>
          </div>
          {pickReview
            .filter((p) => !p.ok)
            .map((p, i) => (
              <div key={i} className="text-ink/60">
                <span className="font-hanzi">{p.hanzi}</span>
                {p.meaning && (
                  <span className="text-ink/45"> = {p.meaning}</span>
                )}
                {' '}statt{' '}
                <span className="font-hanzi">{p.expected}</span>
              </div>
            ))}
          {missingTail.length > 0 && (
            <div className="text-ink/50 italic">
              {missingTail.length === 1
                ? 'Ein Zeichen fehlt.'
                : `${missingTail.length} Zeichen fehlen.`}
            </div>
          )}
        </div>
      )}

      {done && !submitted.correct && mnemonics && (
        <div className="space-y-2">
          {Array.from(
            new Set([
              ...pickReview.filter((p) => !p.ok && p.expected).map((p) => p.expected),
              ...missingTail,
            ])
          )
            .filter((h) => mnemonics?.[h])
            .map((h) => (
              <MnemonicCard
                key={h}
                hanzi={h}
                mnemonics={mnemonics}
                characters={curriculumChars}
                progress={progress}
              />
            ))}
        </div>
      )}

      {!done && (
        <>
          {/* Action row: undo + submit + optional audio hint */}
          <div className="flex gap-2 justify-center items-center">
            <button
              type="button"
              onClick={handleUndo}
              disabled={picked.length === 0 || disabled}
              className="px-4 py-2 border border-ink/20 rounded-lg text-sm hover:border-ink/40 disabled:opacity-30 transition-colors"
            >
              ← Letztes
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={picked.length === 0 || disabled}
              className="px-6 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-30 transition-colors"
            >
              Fertig
            </button>
            {hintAudioText && (
              <SpeakButton text={hintAudioText} size="md" />
            )}
          </div>

          <IMEInput
            curriculumChars={curriculumChars}
            expectedHanzi={expectedPickChars[picked.length]}
            onSelect={handleSelect}
            onEnter={handleSubmit}
            disabled={disabled}
          />
        </>
      )}
    </div>
  )
}
