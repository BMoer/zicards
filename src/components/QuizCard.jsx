import { useState, useEffect } from 'react'
import { comparePinyin, compareMeaning } from '../utils/pinyin'
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
  const { autoSpeak } = useAudio()

  const isReverse = quizType === 'mc-hanzi'

  // Auto-play when showing hanzi (not in reverse mode where we show meaning)
  useEffect(() => {
    if (!isReverse) autoSpeak(character.word || character.hanzi)
  }, [character.hanzi])
  const prompt = isReverse ? character.meaning : character.hanzi
  const promptClass = isReverse ? 'text-2xl font-medium' : 'font-hanzi text-7xl'

  const handleSelect = (option) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    onAnswer(option.isCorrect)
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
 */
function FreetextCard({ character, onAnswer }) {
  const [pinyinInput, setPinyinInput] = useState('')
  const [meaningInput, setMeaningInput] = useState('')
  const [result, setResult] = useState(null)
  const { autoSpeak } = useAudio()

  useEffect(() => {
    autoSpeak(character.word || character.hanzi)
  }, [character.hanzi])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (result) return

    const pinyinCorrect = comparePinyin(pinyinInput, character.pinyin_input)
    const meaningCorrect = compareMeaning(meaningInput, character.meaning)
    const isCorrect = pinyinCorrect && meaningCorrect

    setResult({ pinyinCorrect, meaningCorrect, isCorrect })
    onAnswer(isCorrect)
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
                  : 'border-terracotta bg-terracotta/5'
                : 'border-ink/20 focus:border-ink/40'
            }`}
          />
          {result && !result.pinyinCorrect && (
            <p className="text-sm text-terracotta mt-1 text-left">
              Richtig: {character.pinyin_input} ({character.pinyin})
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
 * Feedback overlay shown after answering
 */
function Feedback({ character, isCorrect, onNext, characters, progress }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(character.word || character.hanzi)
  }, [])

  return (
    <div className="mt-6 p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${isCorrect ? 'text-sage' : 'text-terracotta'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <span className="font-medium">{isCorrect ? 'Richtig!' : 'Nicht ganz.'}</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="font-hanzi text-3xl">{character.hanzi}</span>
        <SpeakButton text={character.word || character.hanzi} size="sm" />
        <div className="text-sm text-ink/60">
          <div>{character.pinyin}</div>
          <div>{character.meaning}</div>
        </div>
      </div>
      {!isCorrect && (
        <MnemonicCard
          hanzi={character.hanzi}
          characters={characters}
          progress={progress}
        />
      )}

      <button
        onClick={onNext}
        className="w-full mt-4 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors"
      >
        Weiter
      </button>
    </div>
  )
}

/**
 * Main QuizCard component – delegates to subcomponents by quizType
 */
export default function QuizCard({ item, options, onAnswer, onNext, characters, progress }) {
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAnswer = (correct) => {
    setAnswered(true)
    setIsCorrect(correct)
    onAnswer(correct)
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
          onNext={() => onNext(false)}
          characters={characters}
          progress={progress}
        />
      )}
    </div>
  )
}
