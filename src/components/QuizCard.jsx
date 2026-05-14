import { useState, useEffect } from 'react'
import { displayHanzi, displayPinyin, usesCompoundForm, meaningForQuiz } from '../utils/pinyin'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'
import GrammarHint from './GrammarHint'
import IMESequenceInput from './IMESequenceInput'

/**
 * Stufe 0: Learn card (just display)
 */
function LearnCard({ character, onNext, characters, progress, mnemonics }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(displayHanzi(character))
  }, [character.hanzi])

  const showsCompound = usesCompoundForm(character)

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-7xl mb-2">{displayHanzi(character)}</div>
      <div className="mb-4">
        <SpeakButton text={displayHanzi(character)} size="md" />
      </div>
      {character.word && !showsCompound && (
        <div className="font-hanzi text-2xl text-ink/60 mb-2">{character.word}</div>
      )}
      <div className="text-lg text-ink/60 mb-1">{displayPinyin(character)}</div>
      {character.pinyin_word && !showsCompound && (
        <div className="text-sm text-ink/40 mb-3">{character.pinyin_word}</div>
      )}
      <div className="text-xl font-medium mb-2">{character.meaning}</div>
      <GrammarHint meaning={character.meaning} />
      {character.radical && (
        <div className="text-sm text-ink/40 mb-4">Radikal: {character.radical}</div>
      )}

      <div className="mb-6">
        <MnemonicCard
          hanzi={character.hanzi}
          mnemonics={mnemonics}
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
 * Stufe 2: Bedeutung → Hànzì MC
 */
function MCCard({ character, options, quizType, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const isReverse = quizType === 'mc-hanzi'
  const prompt = isReverse ? meaningForQuiz(character.meaning) : displayHanzi(character)
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
          <SpeakButton text={displayHanzi(character)} size="md" />
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
 * Stufe 3: Bedeutung → Zeichen via IME-Eingabe.
 * Delegates to IMESequenceInput which handles single chars and multi-char
 * compounds (姐姐, 多少) uniformly.
 */
function IMECard({ character, characters, onAnswer }) {
  const expected = displayHanzi(character)

  return (
    <div className="text-center py-8">
      <div className="text-sm text-ink/40 mb-2">Tippe Pinyin, wähle Zeichen:</div>
      <div className="text-2xl font-medium mb-2">{meaningForQuiz(character.meaning)}</div>
      <GrammarHint meaning={character.meaning} />

      <div className="max-w-md mx-auto mt-6">
        <IMESequenceInput
          expectedSequence={expected}
          curriculumChars={characters}
          onComplete={onAnswer}
        />
      </div>
    </div>
  )
}

/**
 * Feedback overlay shown after answering.
 * Auto-plays the audio for the character so the learner hears how it sounds.
 */
function Feedback({ character, isCorrect, isHalf, onNext, characters, progress, mnemonics }) {
  const { autoSpeak } = useAudio()
  useEffect(() => {
    autoSpeak(displayHanzi(character))
  }, [character.hanzi])
  // No auto-advance – always show mnemonic so user can read it

  const statusIcon = isCorrect ? '✓' : isHalf ? '~' : '✗'
  const statusColor = isCorrect ? 'text-sage' : isHalf ? 'text-amber-500' : 'text-terracotta'
  const statusText = isCorrect ? 'Richtig!' : isHalf ? 'Fast richtig!' : 'Nicht ganz.'

  return (
    <div className="mt-6 p-4 border border-ink/10 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${statusColor}`}>{statusIcon}</span>
        <span className="font-medium">{statusText}</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="font-hanzi text-3xl">{displayHanzi(character)}</span>
        <SpeakButton text={displayHanzi(character)} size="sm" />
        <div className="text-sm text-ink/60">
          <div>{displayPinyin(character)}</div>
          <div>{character.meaning}</div>
          <GrammarHint meaning={character.meaning} />
        </div>
      </div>

      <MnemonicCard
        hanzi={character.hanzi}
        characters={characters}
        progress={progress}
      />

      <p className="text-center text-xs text-ink/30 mt-3">Swipe oder → für weiter</p>
    </div>
  )
}

/**
 * Main QuizCard component – delegates to subcomponents by quizType
 */
export default function QuizCard({ item, options, onAnswer, onNext, characters, progress, mnemonics }) {
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
    return <LearnCard character={item.character} onNext={handleLearnNext} characters={characters} progress={progress} mnemonics={mnemonics} />
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
      {item.quizType === 'ime' && (
        <IMECard
          character={item.character}
          characters={characters}
          onAnswer={handleAnswer}
        />
      )}

      {answered && (
        <Feedback
          character={item.character}
          isCorrect={isCorrect}
          isHalf={isHalf}
          onNext={() => onNext(false)}
          characters={characters}
          progress={progress}
          mnemonics={mnemonics}
        />
      )}
    </div>
  )
}
