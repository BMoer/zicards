import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildUnifiedSession } from '../utils/unifiedSession'
import { generateMCOptions } from '../utils/quiz'
import { saveUnifiedSession, loadUnifiedSession, clearUnifiedSession } from '../utils/sessionStore'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'
import QuizCard from './QuizCard'
import SentenceQuizCard from './SentenceQuizCard'
import UnifiedSessionResult from './UnifiedSessionResult'
import ProgressBar from './ProgressBar'
import SessionNav from './SessionNav'

/**
 * Review card for a past character card.
 */
function CharacterReview({ item, result, characters, progress }) {
  const { character } = item
  const { autoSpeak } = useAudio()

  useEffect(() => {
    autoSpeak(character.word || character.hanzi)
  }, [character.hanzi])

  if (result?.isLearn) {
    return (
      <div className="text-center py-8">
        <div className="font-hanzi text-7xl mb-4">{character.hanzi}</div>
        <div className="mb-4"><SpeakButton text={character.word || character.hanzi} size="md" /></div>
        {character.word && <div className="font-hanzi text-2xl text-ink/60 mb-2">{character.word}</div>}
        <div className="text-lg text-ink/60 mb-1">{character.pinyin}</div>
        {character.pinyin_word && <div className="text-sm text-ink/40 mb-3">{character.pinyin_word}</div>}
        <div className="text-xl font-medium mb-2">{character.meaning}</div>
        {character.radical && <div className="text-sm text-ink/40 mb-4">Radikal: {character.radical}</div>}
        <div className="mt-4">
          <MnemonicCard hanzi={character.hanzi} characters={characters} progress={progress} />
        </div>
        <div className="text-sm text-ink/30 mt-6">Gelernt ✓</div>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-7xl mb-4">{character.hanzi}</div>
      <div className="mb-4"><SpeakButton text={character.word || character.hanzi} size="md" /></div>
      {character.word && <div className="font-hanzi text-2xl text-ink/60 mb-2">{character.word}</div>}
      <div className="text-lg text-ink/60 mb-1">{character.pinyin}</div>
      {character.pinyin_word && <div className="text-sm text-ink/40 mb-3">{character.pinyin_word}</div>}
      <div className="text-xl font-medium mb-4">{character.meaning}</div>

      {result && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          result.isCorrect ? 'bg-sage/10 text-sage'
            : result.isHalf ? 'bg-amber-50 text-amber-600'
            : 'bg-terracotta/10 text-terracotta'
        }`}>
          {result.isCorrect ? '✓ Richtig' : result.isHalf ? '~ Fast richtig' : '✗ Nicht ganz'}
        </div>
      )}

      {result && !result.isCorrect && (
        <div className="mt-4">
          <MnemonicCard hanzi={character.hanzi} characters={characters} progress={progress} />
        </div>
      )}
    </div>
  )
}

/**
 * Review card for a past sentence card.
 */
function SentenceReview({ item, result }) {
  const { sentence } = item
  const { autoSpeak } = useAudio()

  useEffect(() => {
    autoSpeak(sentence.chinese)
  }, [sentence.id])

  return (
    <div className="text-center py-8">
      <div className="font-hanzi text-3xl mb-2 leading-relaxed">{sentence.chinese}</div>
      <div className="mb-4"><SpeakButton text={sentence.chinese} size="md" /></div>
      <div className="text-ink/60 mb-1">{sentence.pinyin}</div>
      <div className="text-lg font-medium mb-2">{sentence.german}</div>
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {sentence.words.map((w, i) => (
          <span key={i} className="px-2 py-1 bg-ink/5 rounded text-sm font-hanzi">{w}</span>
        ))}
      </div>

      {result && !result.isLearn && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          result.isCorrect ? 'bg-sage/10 text-sage' : 'bg-terracotta/10 text-terracotta'
        }`}>
          {result.isCorrect ? '✓ Richtig' : '✗ Nicht ganz'}
        </div>
      )}
      {result?.isLearn && (
        <div className="text-sm text-ink/30 mt-4">Gelernt ✓</div>
      )}
    </div>
  )
}

export default function UnifiedSession({
  characters, charProgress, updateCharProgress, markCharAsSeen,
  sentences, sentenceProgress, updateSentenceProgress, markSentenceAsSeen,
}) {
  const { week } = useParams()
  const navigate = useNavigate()

  const saved = useRef(loadUnifiedSession())
  const isRestored = saved.current && saved.current.week === (week || '__all')

  const [currentIndex, setCurrentIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [viewIndex, setViewIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [results, setResults] = useState(isRestored ? saved.current.results : [])
  const [answered, setAnswered] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [restoredSession, setRestoredSession] = useState(isRestored ? saved.current.session : null)
  const [resultMap, setResultMap] = useState(() => {
    if (isRestored && saved.current.resultMap) return saved.current.resultMap
    return {}
  })

  const lastAdvancedRef = useRef(-1)
  const currentIndexRef = useRef(currentIndex)
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  // Filter by week if specified
  const filteredChars = useMemo(() => {
    if (week) return characters.filter((c) => c.week === parseInt(week))
    return characters
  }, [characters, week])

  const filteredSentences = useMemo(() => {
    if (week) return sentences.filter((s) => s.week === parseInt(week))
    return sentences
  }, [sentences, week])

  // Snapshot progress when session starts/restarts
  const charProgressRef = useRef(charProgress)
  const sentProgressRef = useRef(sentenceProgress)
  useEffect(() => {
    if (!isRestored || sessionKey > 0) {
      charProgressRef.current = { ...charProgress }
      sentProgressRef.current = { ...sentenceProgress }
    }
  }, [sessionKey])

  const session = useMemo(() => {
    if (restoredSession && sessionKey === 0) return restoredSession
    return buildUnifiedSession(
      filteredChars, charProgressRef.current,
      filteredSentences, sentProgressRef.current
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredChars, filteredSentences, sessionKey, restoredSession])

  // Persist session state
  useEffect(() => {
    if (session.length > 0 && currentIndex < session.length) {
      saveUnifiedSession({ week: week || '__all', currentIndex, results, session, resultMap })
    }
  }, [currentIndex, results, session, week, resultMap])

  // Clear session when complete
  useEffect(() => {
    if (currentIndex >= session.length && session.length > 0) {
      clearUnifiedSession()
    }
  }, [currentIndex, session.length])

  const currentItem = session[currentIndex]
  const viewItem = session[viewIndex]
  const isReviewing = viewIndex < currentIndex
  const isLearnCard = !isReviewing && currentItem?.quizType === 'learn'
  const showResults = viewIndex >= session.length
  const canGoNext = !showResults && (isReviewing || isLearnCard || answered)
  const canGoBack = viewIndex > 0

  // MC options for character quiz cards
  const mcOptions = useMemo(() => {
    if (!currentItem || currentItem.type !== 'character') return []
    if (currentItem.quizType === 'mc-meaning') {
      return generateMCOptions(currentItem.character, characters, 'meaning')
    }
    if (currentItem.quizType === 'mc-hanzi') {
      return generateMCOptions(currentItem.character, characters, 'hanzi')
    }
    return []
  }, [currentItem, characters])

  const handleAnswer = async (isCorrect) => {
    const item = session[currentIndex]
    let levelChange = 0
    if (item.type === 'character') {
      const res = await updateCharProgress(item.character.id, isCorrect)
      levelChange = res.levelChange
    } else {
      const res = await updateSentenceProgress(item.sentence.id, isCorrect)
      levelChange = res.levelChange
    }
    const result = {
      type: item.type,
      ...(item.type === 'character' ? { character: item.character } : { sentence: item.sentence }),
      isCorrect: isCorrect === true,
      isHalf: isCorrect === 'half',
      levelChange,
    }
    setResults((prev) => [...prev, result])
    setResultMap((prev) => ({ ...prev, [currentIndex]: result }))
    setAnswered(true)
  }

  const handleNext = async (isLearnCard) => {
    const ci = currentIndexRef.current
    if (lastAdvancedRef.current === ci) return
    lastAdvancedRef.current = ci

    if (isLearnCard) {
      const item = session[ci]
      if (item.type === 'character') {
        await markCharAsSeen(item.character.id)
      } else {
        await markSentenceAsSeen(item.sentence.id)
      }
      setResultMap((prev) => ({ ...prev, [ci]: { isLearn: true, isCorrect: true, type: item.type } }))
    }
    const next = ci + 1
    setCurrentIndex(next)
    setViewIndex((prev) => (prev === ci ? next : prev))
    setAnswered(false)
  }

  const advance = useCallback(() => {
    if (viewIndex < currentIndex) {
      setViewIndex((v) => v + 1)
    } else if (currentItem?.quizType === 'learn') {
      handleNext(true)
    } else if (answered) {
      handleNext(false)
    }
  }, [viewIndex, currentIndex, currentItem, answered])

  const goBack = useCallback(() => {
    if (viewIndex > 0) setViewIndex((v) => v - 1)
  }, [viewIndex])

  const handleRestart = useCallback(() => {
    charProgressRef.current = { ...charProgress }
    sentProgressRef.current = { ...sentenceProgress }
    clearUnifiedSession()
    setRestoredSession(null)
    setCurrentIndex(0)
    setViewIndex(0)
    setResults([])
    setResultMap({})
    setAnswered(false)
    lastAdvancedRef.current = -1
    setSessionKey((k) => k + 1)
  }, [charProgress, sentenceProgress])

  const handleExit = useCallback(() => {
    clearUnifiedSession()
    navigate('/')
  }, [navigate])

  if (session.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/40 mb-4">Nichts zum Üben gefunden.</p>
        <button onClick={handleExit} className="text-terracotta hover:underline text-sm">
          Zurück
        </button>
      </div>
    )
  }

  if (showResults) {
    return (
      <SessionNav canGoNext={false} canGoBack={canGoBack} onNext={() => {}} onBack={goBack}>
        <UnifiedSessionResult results={results} onRestart={handleRestart} />
      </SessionNav>
    )
  }

  return (
    <SessionNav canGoNext={canGoNext} canGoBack={canGoBack} onNext={advance} onBack={goBack}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={handleExit} className="text-sm text-ink/50 hover:text-ink">
          ✕
        </button>
        <span className="text-sm text-ink/40">
          {viewIndex + 1} / {session.length}
        </span>
      </div>
      <ProgressBar current={currentIndex} total={session.length} className="mb-6" />

      {/* Review mode */}
      {isReviewing && viewItem.type === 'character' && (
        <CharacterReview item={viewItem} result={resultMap[viewIndex]} characters={characters} progress={charProgress} />
      )}
      {isReviewing && viewItem.type === 'sentence' && (
        <SentenceReview item={viewItem} result={resultMap[viewIndex]} />
      )}

      {/* Active card */}
      <div style={{ display: isReviewing ? 'none' : undefined }}>
        {currentItem.type === 'character' ? (
          <QuizCard
            key={`${sessionKey}-${currentIndex}`}
            item={currentItem}
            options={mcOptions}
            onAnswer={handleAnswer}
            onNext={handleNext}
            characters={characters}
            progress={charProgress}
          />
        ) : (
          <SentenceQuizCard
            key={`${sessionKey}-${currentIndex}`}
            item={currentItem}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}
      </div>
    </SessionNav>
  )
}
