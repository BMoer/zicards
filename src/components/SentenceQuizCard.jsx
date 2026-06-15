import { useState, useEffect, useRef } from 'react'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import IMESequenceInput from './IMESequenceInput'
import { getShuffledWords, checkWordOrder, findGapSpan } from '../utils/sentenceQuiz'
import { findSingleMisplacement } from '../utils/wordOrderDiff'
import { lookupGrammarRule } from '../data/grammarRules'

/**
 * Stufe 0: Show sentence (learn card)
 */
function SentenceLearnCard({ sentence, onNext }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(sentence.chinese)
  }, [sentence.id])

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-3xl mb-2 leading-relaxed">{sentence.chinese}</div>
      <div className="mb-4">
        <SpeakButton text={sentence.chinese} size="md" />
      </div>
      <div className="text-ink/60 mb-1">{sentence.pinyin}</div>
      <div className="text-lg font-medium mb-2">{sentence.german}</div>
      <div className="flex flex-wrap justify-center gap-1.5 mb-6">
        {sentence.words.map((w, i) => (
          <span key={i} className="px-2 py-1 bg-ink/5 rounded text-sm font-hanzi">{w}</span>
        ))}
      </div>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
      >
        Verstanden
      </button>
    </div>
  )
}

/**
 * Stufe 1: Word Order – arrange words into correct sentence
 */
function WordOrderCard({ sentence, onAnswer }) {
  const [available, setAvailable] = useState([])
  const [selected, setSelected] = useState([])
  const [trailing, setTrailing] = useState([])
  const [result, setResult] = useState(null)
  const [hintUsed, setHintUsed] = useState(false)

  useEffect(() => {
    const { shuffled, trailing: t } = getShuffledWords(sentence.words)
    setAvailable(shuffled.map((w, i) => ({ word: w, id: i })))
    setSelected([])
    setTrailing(t)
    setResult(null)
    setHintUsed(false)
  }, [sentence.id])

  const handleSelect = (item) => {
    if (result) return
    setAvailable((prev) => prev.filter((a) => a.id !== item.id))
    setSelected((prev) => [...prev, item])
  }

  const handleDeselect = (item) => {
    if (result) return
    setSelected((prev) => prev.filter((s) => s.id !== item.id))
    setAvailable((prev) => [...prev, item])
  }

  const handleCheck = () => {
    const userOrder = selected.map((s) => s.word)
    const isCorrect = checkWordOrder(userOrder, sentence.words)
    setResult(isCorrect)
    if (isCorrect) {
      onAnswer(hintUsed ? 'half' : true)
    } else {
      const punct = new Set(['。', '！', '？', '，', '、'])
      const correctFiltered = sentence.words.filter((w) => !punct.has(w))
      const misplacement = findSingleMisplacement(userOrder, correctFiltered)
      const rule = misplacement ? lookupGrammarRule(misplacement.word) : null
      const hint = misplacement
        ? { kind: 'word-order', misplacement, rule }
        : null
      onAnswer(false, hint)
    }
    // No autoSpeak here — SentenceFeedback auto-plays once after answer,
    // calling it twice produces overlapping audio (reported 2026-05-10).
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <div className="text-sm text-ink/40 uppercase tracking-wider mb-2">Ordne die Wörter</div>
        <div className="text-lg font-medium">{sentence.german}</div>
      </div>

      {/* Selected words (answer area) */}
      <div className="min-h-[56px] p-3 mb-4 border-2 border-dashed border-ink/15 rounded-lg flex flex-wrap gap-2 items-center">
        {selected.map((item) => (
          <button
            key={item.id}
            onClick={() => handleDeselect(item)}
            className={`px-3 py-1.5 rounded-lg font-hanzi text-lg transition-colors ${
              result === null
                ? 'bg-ink text-paper'
                : result
                ? 'bg-sage/20 text-sage border border-sage/40'
                : 'bg-terracotta/15 text-terracotta border border-terracotta/40'
            }`}
          >
            {item.word}
          </button>
        ))}
        {selected.length > 0 && trailing.map((t, i) => (
          <span key={`t-${i}`} className="font-hanzi text-lg text-ink/40">{t}</span>
        ))}
        {selected.length === 0 && (
          <span className="text-ink/25 text-sm">Tippe auf die Wörter…</span>
        )}
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {available.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            disabled={!!result}
            className="px-3 py-1.5 border border-ink/20 rounded-lg font-hanzi text-lg hover:border-ink/40 active:bg-ink/5 transition-colors disabled:opacity-30"
          >
            {item.word}
          </button>
        ))}
      </div>

      {result === null && (
        <div className="flex flex-col items-center gap-2 mb-2">
          <SpeakButton
            text={sentence.chinese}
            size="md"
            onPlay={() => setHintUsed(true)}
            title={
              hintUsed
                ? 'Audio gehört (zählt als Hilfe — max. neutral statt richtig)'
                : 'Audio als Hilfe anhören (zählt dann nicht als richtig)'
            }
          />
          {hintUsed && (
            <div className="text-xs text-amber-700/70">
              Audio gehört — wird als neutral statt richtig gewertet.
            </div>
          )}
        </div>
      )}

      {result === null && selected.length > 0 && available.length === 0 && (
        <button
          onClick={handleCheck}
          className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
        >
          Prüfen
        </button>
      )}

      {result !== null && !result && (
        <div className="text-center text-sm text-ink/50">
          <span className="font-hanzi text-base">{sentence.chinese}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Stufe 2: Fill the gap via IME — type pinyin, pick the missing hànzì.
 */
function GapCard({ sentence, characters, mnemonics, progress, onAnswer }) {
  const [done, setDone] = useState(false)
  // Intentionally NO autoSpeak on mount: hearing the sentence before the
  // gap is filled would just hand the learner the answer
  // ("eigentlich machts am meisten sinn wenn wir den ton nur abspielen
  // sobald die eingabe erfolgt ist", 2026-05-10).

  // gap_word may be a single token in words[] (词典) or split across single-char
  // tokens (全 + 班); findGapSpan locates the inclusive range either way. A
  // single blank covers the whole span, so the answer is never shown.
  const gapSpan = findGapSpan(sentence.words, sentence.gap_word)

  const handleComplete = (correct, hintUsed) => {
    setDone(true)
    if (!correct) onAnswer(false)
    else onAnswer(hintUsed ? 'half' : true)
  }

  const renderBlank = (key) => (
    <span
      key={key}
      className={`inline-block min-w-[3em] border-b-2 text-center mx-0.5 ${
        done ? 'border-ink/30 text-ink/50' : 'border-terracotta/50'
      }`}
    >
      {done ? sentence.gap_word : '___'}
    </span>
  )

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <div className="text-sm text-ink/40 uppercase tracking-wider mb-2">Fülle die Lücke</div>
        <div className="text-sm text-ink/50 mb-3">{sentence.german}</div>
        <div className="flex flex-wrap justify-center items-center gap-1 font-hanzi text-2xl leading-relaxed">
          {gapSpan
            ? sentence.words.map((w, i) => {
                if (i === gapSpan.start) return renderBlank(i)
                if (i > gapSpan.start && i <= gapSpan.end) return null // covered by the blank
                return <span key={i}>{w}</span>
              })
            : // Defensive: gap_word not locatable in words[] — show only a blank
              // rather than leak the full sentence.
              renderBlank('gap')}
        </div>
        {sentence.gap_hint && !done && (
          <div className="text-xs text-ink/30 mt-2">Hinweis: {sentence.gap_hint}</div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <IMESequenceInput
          expectedSequence={sentence.gap_word}
          curriculumChars={characters}
          mnemonics={mnemonics}
          progress={progress}
          onComplete={handleComplete}
          disabled={done}
          hintAudioText={sentence.chinese}
        />
      </div>
    </div>
  )
}

/**
 * Stufe 3: Translate German → Chinese — full sentence via IME, char by char.
 */
function TranslateCard({ sentence, characters, mnemonics, progress, onAnswer }) {
  const [done, setDone] = useState(false)

  const handleComplete = (correct, hintUsed) => {
    setDone(true)
    if (!correct) onAnswer(false)
    else onAnswer(hintUsed ? 'half' : true)
    // No autoSpeak here — SentenceFeedback handles it on mount.
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <div className="text-sm text-ink/40 uppercase tracking-wider mb-2">Übersetze ins Chinesische</div>
        <div className="text-xl font-medium">{sentence.german}</div>
      </div>

      <div className="max-w-md mx-auto">
        <IMESequenceInput
          expectedSequence={sentence.words}
          acceptedVariants={sentence.accepted_variants ?? []}
          curriculumChars={characters}
          mnemonics={mnemonics}
          progress={progress}
          onComplete={handleComplete}
          disabled={done}
          hintAudioText={sentence.chinese}
        />
      </div>
    </div>
  )
}

/**
 * Feedback shown after answering
 */
function WordOrderGrammarHint({ hint }) {
  if (!hint || hint.kind !== 'word-order') return null
  const { misplacement, rule } = hint
  return (
    <div className="mb-3 p-3 bg-paper border border-ink/10 rounded-lg text-sm">
      <div className="text-ink/70 mb-1">
        <span className="font-hanzi text-base">{misplacement.word}</span>
        <span className="text-ink/50"> stand an der falschen Stelle.</span>
      </div>
      {rule && (
        <div className="mt-2 pt-2 border-t border-ink/5">
          <div className="font-medium text-ink/80 mb-1">{rule.title}</div>
          <div className="text-ink/70 mb-1">{rule.rule}</div>
          <div className="text-ink/60">
            <span className="font-hanzi">{rule.example_zh}</span>
            <span className="text-ink/40"> — {rule.example_de}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function SentenceFeedback({ sentence, isCorrect, isHalf, hint, onNext }) {
  const timerRef = useRef(null)
  const { autoSpeak } = useAudio()

  // Always play the audio after answering — fulfils the
  // "Ich hätte gerne den Sound gehört wenn ich die Frage beantwortet habe"
  // feedback (2026-04-30) and supports passive tone learning.
  useEffect(() => {
    autoSpeak(sentence.chinese)
  }, [sentence.id])

  // Auto-advance when correct (or half-credit — answer was right, just
  // hint-assisted, no need to dwell on the reveal).
  useEffect(() => {
    if (isCorrect || isHalf) {
      timerRef.current = setTimeout(() => onNext(), 1800)
    }
    return () => clearTimeout(timerRef.current)
  }, [isCorrect, isHalf])

  const statusIcon = isCorrect ? '✓' : isHalf ? '~' : '✗'
  const statusColor = isCorrect ? 'text-sage' : isHalf ? 'text-amber-500' : 'text-terracotta'
  const statusText = isCorrect
    ? 'Richtig!'
    : isHalf
    ? 'Richtig — mit Audio-Hilfe (zählt neutral).'
    : 'Nicht ganz.'

  return (
    <div className="mt-6 p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${statusColor}`}>{statusIcon}</span>
        <span className="font-medium">{statusText}</span>
      </div>
      {!isCorrect && !isHalf && <WordOrderGrammarHint hint={hint} />}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-hanzi text-xl">{sentence.chinese}</span>
          <SpeakButton text={sentence.chinese} size="sm" />
        </div>
        <div className="text-sm text-ink/50">{sentence.pinyin}</div>
        <div className="text-sm text-ink/60">{sentence.german}</div>
      </div>
      {(isCorrect || isHalf) ? (
        <p className="text-center text-xs text-ink/30 mt-3">Automatisch weiter…</p>
      ) : (
        <p className="text-center text-xs text-ink/30 mt-3">Swipe oder → für weiter</p>
      )}
    </div>
  )
}

/**
 * Main SentenceQuizCard – delegates to sub-components by quizType
 */
export default function SentenceQuizCard({ item, onAnswer, onNext, characters, mnemonics, progress }) {
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isHalf, setIsHalf] = useState(false)
  const [hint, setHint] = useState(null)

  const handleAnswer = (correct, answerHint = null) => {
    setAnswered(true)
    if (correct === 'half') {
      setIsCorrect(false)
      setIsHalf(true)
    } else {
      setIsCorrect(!!correct)
      setIsHalf(false)
    }
    setHint(answerHint)
    onAnswer(correct)
  }

  if (item.quizType === 'learn') {
    return (
      <SentenceLearnCard
        sentence={item.sentence}
        onNext={() => onNext(true)}
      />
    )
  }

  return (
    <div>
      {item.quizType === 'order' && (
        <WordOrderCard sentence={item.sentence} onAnswer={handleAnswer} />
      )}
      {item.quizType === 'gap' && (
        <GapCard sentence={item.sentence} characters={characters} mnemonics={mnemonics} progress={progress} onAnswer={handleAnswer} />
      )}
      {item.quizType === 'translate' && (
        <TranslateCard sentence={item.sentence} characters={characters} mnemonics={mnemonics} progress={progress} onAnswer={handleAnswer} />
      )}
      {answered && (
        <SentenceFeedback
          sentence={item.sentence}
          isCorrect={isCorrect}
          isHalf={isHalf}
          hint={hint}
          onNext={() => onNext(false)}
        />
      )}
    </div>
  )
}
