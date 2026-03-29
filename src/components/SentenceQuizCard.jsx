import { useState, useEffect } from 'react'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import { getShuffledWords, checkWordOrder, checkGapAnswer, checkTranslation } from '../utils/sentenceQuiz'

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
  const { autoSpeak } = useAudio()
  const [available, setAvailable] = useState([])
  const [selected, setSelected] = useState([])
  const [trailing, setTrailing] = useState([])
  const [result, setResult] = useState(null)

  useEffect(() => {
    const { shuffled, trailing: t } = getShuffledWords(sentence.words)
    setAvailable(shuffled.map((w, i) => ({ word: w, id: i })))
    setSelected([])
    setTrailing(t)
    setResult(null)
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
    onAnswer(isCorrect)
    if (isCorrect) autoSpeak(sentence.chinese)
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
 * Stufe 2: Fill the gap
 */
function GapCard({ sentence, onAnswer }) {
  const { autoSpeak } = useAudio()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    autoSpeak(sentence.chinese)
  }, [sentence.id])

  // Build display with gap
  const gapIndex = sentence.words.indexOf(sentence.gap_word)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (result !== null) return
    const isCorrect = checkGapAnswer(input, sentence.gap_word)
    setResult(isCorrect)
    onAnswer(isCorrect)
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <div className="text-sm text-ink/40 uppercase tracking-wider mb-2">Fülle die Lücke</div>
        <div className="text-sm text-ink/50 mb-3">{sentence.german}</div>
        <div className="flex flex-wrap justify-center items-center gap-1 font-hanzi text-2xl leading-relaxed">
          {sentence.words.map((w, i) => {
            if (i === gapIndex) {
              return (
                <span key={i} className={`inline-block min-w-[3em] border-b-2 text-center mx-0.5 ${
                  result === null
                    ? 'border-terracotta/50'
                    : result
                    ? 'border-sage text-sage'
                    : 'border-terracotta text-terracotta'
                }`}>
                  {result !== null ? sentence.gap_word : '___'}
                </span>
              )
            }
            return <span key={i}>{w}</span>
          })}
        </div>
        {sentence.gap_hint && result === null && (
          <div className="text-xs text-ink/30 mt-2">Hinweis: {sentence.gap_hint}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Chinesisches Wort eintippen"
          disabled={result !== null}
          autoFocus
          className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none text-center font-hanzi text-lg transition-colors ${
            result === null
              ? 'border-ink/20 focus:border-ink/40'
              : result
              ? 'border-sage bg-sage/5'
              : 'border-terracotta bg-terracotta/5'
          }`}
        />
        {result !== null && !result && (
          <p className="text-sm text-terracotta mt-2 text-center">
            Richtig: <span className="font-hanzi">{sentence.gap_word}</span>
          </p>
        )}
        {result === null && (
          <button
            type="submit"
            className="w-full mt-3 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
          >
            Prüfen
          </button>
        )}
      </form>
    </div>
  )
}

/**
 * Stufe 3: Translate German → Chinese
 */
function TranslateCard({ sentence, onAnswer }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const { autoSpeak } = useAudio()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (result !== null) return
    const isCorrect = checkTranslation(input, sentence.chinese)
    setResult(isCorrect)
    onAnswer(isCorrect)
    if (isCorrect) autoSpeak(sentence.chinese)
  }

  return (
    <div className="py-8">
      <div className="text-center mb-6">
        <div className="text-sm text-ink/40 uppercase tracking-wider mb-2">Übersetze ins Chinesische</div>
        <div className="text-xl font-medium">{sentence.german}</div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="中文..."
          disabled={result !== null}
          autoFocus
          className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none text-center font-hanzi text-lg transition-colors ${
            result === null
              ? 'border-ink/20 focus:border-ink/40'
              : result
              ? 'border-sage bg-sage/5'
              : 'border-terracotta bg-terracotta/5'
          }`}
        />
        {result !== null && !result && (
          <p className="text-sm text-terracotta mt-2 text-center">
            Richtig: <span className="font-hanzi">{sentence.chinese}</span>
          </p>
        )}
        {result === null && (
          <button
            type="submit"
            className="w-full mt-3 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
          >
            Prüfen
          </button>
        )}
      </form>
    </div>
  )
}

/**
 * Feedback shown after answering
 */
function SentenceFeedback({ sentence, isCorrect, onNext }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(sentence.chinese)
  }, [])

  return (
    <div className="mt-6 p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${isCorrect ? 'text-sage' : 'text-terracotta'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <span className="font-medium">{isCorrect ? 'Richtig!' : 'Nicht ganz.'}</span>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-hanzi text-xl">{sentence.chinese}</span>
          <SpeakButton text={sentence.chinese} size="sm" />
        </div>
        <div className="text-sm text-ink/50">{sentence.pinyin}</div>
        <div className="text-sm text-ink/60">{sentence.german}</div>
      </div>
      <button
        onClick={onNext}
        className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
      >
        Weiter
      </button>
    </div>
  )
}

/**
 * Main SentenceQuizCard – delegates to sub-components by quizType
 */
export default function SentenceQuizCard({ item, onAnswer, onNext }) {
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAnswer = (correct) => {
    setAnswered(true)
    setIsCorrect(correct)
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
        <GapCard sentence={item.sentence} onAnswer={handleAnswer} />
      )}
      {item.quizType === 'translate' && (
        <TranslateCard sentence={item.sentence} onAnswer={handleAnswer} />
      )}
      {answered && (
        <SentenceFeedback
          sentence={item.sentence}
          isCorrect={isCorrect}
          onNext={() => onNext(false)}
        />
      )}
    </div>
  )
}
