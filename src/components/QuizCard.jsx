import { useState, useEffect, useRef } from 'react'
import { comparePinyin, compareMeaning, isPinyinToneWrong } from '../utils/pinyin'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'

/**
 * Stufe 0: Learn card (just display)
 */
function LearnCard({ character, onNext, characters, progress }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(character.word || character.hanzi)
  }, [character.hanzi])

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-7xl mb-2">{character.hanzi}</div>
      <div className="mb-4">
        <SpeakButton text={character.word || character.hanzi} size="md" />
      </div>
      {character.word && (
        <div className="font-hanzi text-2xl text-ink/60 mb-2">{character.word}</div>
      )}
      <div className="text-lg text-ink/60 mb-1">{character.pinyin}</div>
      {character.pinyin_word && (
        <div className="text-sm text-ink/40 mb-3">{character.pinyin_word}</div>
      )}
      <div className="text-xl font-medium mb-2">{character.meaning}</div>
      {character.radical && (
        <div className="text-sm text-ink/40 mb-4">Radikal: {character.radical}</div>
      )}

      <div className="mb-6">
        <MnemonicCard
          hanzi={character.hanzi}
          characters={characters}
          progress={progress}
        />
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
 * Stufe 1: Hànzì → Bedeutung MC
 * Stufe 3: Bedeutung → Hànzì MC
 */
function MCCard({ character, options, quizType, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const isReverse = quizType === 'mc-hanzi'
  const prompt = isReverse ? character.meaning : character.hanzi
  const promptClass = isReverse ? 'text-2xl font-medium' : 'font-hanzi text-7xl'

  // No auto-play on quiz cards – would make it too easy

  const handleSelect = (option) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    onAnswer(option.isCorrect ? true : false)
  }

  return (
    <div className="text-center py-8">
      <div className={`${promptClass} mb-2`}>{prompt}</div>
      {!isReverse && (
        <div className="mb-6">
          <SpeakButton text={character.word || character.hanzi} size="md" />
        </div>
      )}
      {isReverse && <div className="mb-8" />}

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          let btnClass = 'p-4 border rounded-lg text-center transition-colors '
          if (isReverse) btnClass += 'font-hanzi text-3xl '

          if (!answered) {
            btnClass += 'border-ink/15 hover:border-ink/30 active:bg-ink/5'
          } else if (opt.isCorrect) {
            btnClass += 'border-sage bg-sage/10 text-sage'
          } else if (opt === selected && !opt.isCorrect) {
            btnClass += 'border-terracotta bg-terracotta/10 text-terracotta'
          } else {
            btnClass += 'border-ink/10 opacity-40'
          }

          return (
            <button key={i} onClick={() => handleSelect(opt)} className={btnClass} disabled={answered}>
              {opt.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Stufe 2: Hànzì → Pinyin + Bedeutung Freitext
 * Supports "half correct" when only tone is wrong
 */
function FreetextCard({ character, onAnswer }) {
  const [pinyinInput, setPinyinInput] = useState('')
  const [meaningInput, setMeaningInput] = useState('')
  const [result, setResult] = useState(null)

  // No auto-play – hearing the tone gives away the pinyin answer!

  const handleSubmit = (e) => {
    e.preventDefault()
    if (result) return

    const pinyinCorrect = comparePinyin(pinyinInput, character.pinyin_input)
    const meaningCorrect = compareMeaning(meaningInput, character.meaning)
    const toneWrong = !pinyinCorrect && isPinyinToneWrong(pinyinInput, character.pinyin_input)

    const isCorrect = pinyinCorrect && meaningCorrect
    // Half correct: meaning right + only tone wrong
    const isHalf = !isCorrect && meaningCorrect && toneWrong

    setResult({ pinyinCorrect, meaningCorrect, toneWrong, isCorrect, isHalf })
    onAnswer(isCorrect ? true : isHalf ? 'half' : false)
  }

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-7xl mb-2">{character.hanzi}</div>
      <div className="mb-6">
        <SpeakButton text={character.word || character.hanzi} size="md" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xs mx-auto">
        <div>
          <input
            type="text"
            value={pinyinInput}
            onChange={(e) => setPinyinInput(e.target.value)}
            placeholder="Pinyin (z.B. ma1)"
            disabled={!!result}
            autoFocus
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none transition-colors ${
              result
                ? result.pinyinCorrect
                  ? 'border-sage bg-sage/5'
                  : result.toneWrong
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-terracotta bg-terracotta/5'
                : 'border-ink/20 focus:border-ink/40'
            }`}
          />
          {result && !result.pinyinCorrect && (
            <p className={`text-sm mt-1 text-left ${result.toneWrong ? 'text-amber-600' : 'text-terracotta'}`}>
              {result.toneWrong ? 'Fast! Richtiger Ton: ' : 'Richtig: '}
              {character.pinyin_input} ({character.pinyin})
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            value={meaningInput}
            onChange={(e) => setMeaningInput(e.target.value)}
            placeholder="Bedeutung"
            disabled={!!result}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none transition-colors ${
              result
                ? result.meaningCorrect
                  ? 'border-sage bg-sage/5'
                  : 'border-terracotta bg-terracotta/5'
                : 'border-ink/20 focus:border-ink/40'
            }`}
          />
          {result && !result.meaningCorrect && (
            <p className="text-sm text-terracotta mt-1 text-left">
              Richtig: {character.meaning}
            </p>
          )}
        </div>

        {!result && (
          <button
            type="submit"
            className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
          >
            Prüfen
          </button>
        )}
      </form>
    </div>
  )
}

/**
 * Feedback overlay shown after answering.
 * Auto-advances after 1.5s when correct.
 */
function Feedback({ character, isCorrect, isHalf, onNext, characters, progress }) {
  const { autoSpeak } = useAudio()
  const timerRef = useRef(null)

  useEffect(() => {
    autoSpeak(character.word || character.hanzi)
  }, [])

  // Auto-advance when fully correct
  useEffect(() => {
    if (isCorrect && !isHalf) {
      timerRef.current = setTimeout(() => onNext(), 1800)
    }
    return () => clearTimeout(timerRef.current)
  }, [isCorrect, isHalf])

  const statusIcon = isCorrect ? '✓' : isHalf ? '~' : '✗'
  const statusColor = isCorrect ? 'text-sage' : isHalf ? 'text-amber-500' : 'text-terracotta'
  const statusText = isCorrect ? 'Richtig!' : isHalf ? 'Fast richtig – nur der Ton!' : 'Nicht ganz.'

  return (
    <div className="mt-6 p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${statusColor}`}>{statusIcon}</span>
        <span className="font-medium">{statusText}</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="font-hanzi text-3xl">{character.hanzi}</span>
        <SpeakButton text={character.word || character.hanzi} size="sm" />
        <div className="text-sm text-ink/60">
          <div>{character.pinyin}</div>
          <div>{character.meaning}</div>
        </div>
      </div>

      {/* Show mnemonic on wrong or half-correct */}
      {!isCorrect && (
        <MnemonicCard
          hanzi={character.hanzi}
          characters={characters}
          progress={progress}
        />
      )}

      {isCorrect && !isHalf ? (
        <p className="text-center text-xs text-ink/30 mt-3">Automatisch weiter…</p>
      ) : (
        <p className="text-center text-xs text-ink/30 mt-3">Swipe oder → für weiter</p>
      )}
    </div>
  )
}

/**
 * Main QuizCard component – delegates to subcomponents by quizType
 */
export default function QuizCard({ item, options, onAnswer, onNext, characters, progress }) {
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isHalf, setIsHalf] = useState(false)

  const handleAnswer = (result) => {
    setAnswered(true)
    if (result === 'half') {
      setIsCorrect(false)
      setIsHalf(true)
      onAnswer('half')
    } else {
      setIsCorrect(result)
      setIsHalf(false)
      onAnswer(result)
    }
  }

  const handleLearnNext = () => {
    onNext(true) // learn cards are always "correct" (seen)
  }

  if (item.quizType === 'learn') {
    return <LearnCard character={item.character} onNext={handleLearnNext} characters={characters} progress={progress} />
  }

  return (
    <div>
      {item.quizType === 'mc-meaning' && (
        <MCCard
          character={item.character}
          options={options}
          quizType="mc-meaning"
          onAnswer={handleAnswer}
        />
      )}
      {item.quizType === 'mc-hanzi' && (
        <MCCard
          character={item.character}
          options={options}
          quizType="mc-hanzi"
          onAnswer={handleAnswer}
        />
      )}
      {item.quizType === 'freetext' && (
        <FreetextCard character={item.character} onAnswer={handleAnswer} />
      )}

      {answered && (
        <Feedback
          character={item.character}
          isCorrect={isCorrect}
          isHalf={isHalf}
          onNext={() => onNext(false)}
          characters={characters}
          progress={progress}
        />
      )}
    </div>
  )
}
