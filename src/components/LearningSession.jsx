import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSession, generateMCOptions } from '../utils/quiz'
import { saveCharSession, loadCharSession, clearCharSession } from '../utils/sessionStore'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import MnemonicCard from './MnemonicCard'
import QuizCard from './QuizCard'
import SessionResult from './SessionResult'
import ProgressBar from './ProgressBar'
import SessionNav from './SessionNav'

/**
 * Review card shown when navigating back to a past card.
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

export default function LearningSession({ characters, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()

  // Try to restore saved session
  const saved = useRef(loadCharSession())
  const isRestored = saved.current && saved.current.week === (week || '__all')

  const [currentIndex, setCurrentIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [viewIndex, setViewIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [results, setResults] = useState(isRestored ? saved.current.results : [])
  const [answered, setAnswered] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [restoredSession, setRestoredSession] = useState(isRestored ? saved.current.session : null)

  // Result map: cardIndex → result (for review navigation)
  const [resultMap, setResultMap] = useState(() => {
    // Rebuild from restored results
    if (isRestored && saved.current.resultMap) return saved.current.resultMap
    return {}
  })

  // Guard against double-advance (race between auto-advance and manual nav)
  const lastAdvancedRef = useRef(-1)
  const currentIndexRef = useRef(currentIndex)
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  // Filter characters by week if specified
  const filteredChars = useMemo(() => {
    if (week) return characters.filter((c) => c.week === parseInt(week))
    return characters
  }, [characters, week])

  // Snapshot progress when session starts/restarts
  const progressSnapshotRef = useRef(progress)
  useEffect(() => {
    if (!isRestored || sessionKey > 0) {
      progressSnapshotRef.current = { ...progress }
    }
  }, [sessionKey])

  // Build session (use restored or build new)
  const session = useMemo(() => {
    if (restoredSession && sessionKey === 0) return restoredSession
    return buildSession(filteredChars, progressSnapshotRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredChars, sessionKey, restoredSession])

  // Persist session state on every change
  useEffect(() => {
    if (session.length > 0 && currentIndex < session.length) {
      saveCharSession({
        week: week || '__all',
        currentIndex,
        results,
        session,
        resultMap,
      })
    }
  }, [currentIndex, results, session, week, resultMap])

  // Clear session when complete
  useEffect(() => {
    if (currentIndex >= session.length && session.length > 0) {
      clearCharSession()
    }
  }, [currentIndex, session.length])

  const currentItem = session[currentIndex]
  const viewItem = session[viewIndex]
  const isReviewing = viewIndex < currentIndex
  const isLearnCard = !isReviewing && currentItem?.quizType === 'learn'
  const showResults = viewIndex >= session.length
  const canGoNext = !showResults && (isReviewing || isLearnCard || answered)
  const canGoBack = viewIndex > 0

  // Generate MC options for current (active) item
  const mcOptions = useMemo(() => {
    if (!currentItem) return []
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
    const { levelChange } = await updateProgress(item.character.id, isCorrect)
    const result = {
      character: item.character,
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
    // Guard against double-advance
    if (lastAdvancedRef.current === ci) return
    lastAdvancedRef.current = ci

    if (isLearnCard) {
      await markAsSeen(session[ci]?.character.id)
      // Track learn card in resultMap for review
      setResultMap((prev) => ({ ...prev, [ci]: { isLearn: true, isCorrect: true } }))
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
    clearCharSession()
    setRestoredSession(null)
    setCurrentIndex(0)
    setViewIndex(0)
    setResults([])
    setResultMap({})
    setAnswered(false)
    lastAdvancedRef.current = -1
    setSessionKey((k) => k + 1)
  }, [])

  const handleExit = useCallback(() => {
    clearCharSession()
    navigate('/')
  }, [navigate])

  if (session.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/40 mb-4">Keine Zeichen zum Üben gefunden.</p>
        <button onClick={handleExit} className="text-terracotta hover:underline text-sm">
          Zurück
        </button>
      </div>
    )
  }

  // Session complete – show results
  if (showResults) {
    return (
      <SessionNav canGoNext={false} canGoBack={canGoBack} onNext={() => {}} onBack={goBack}>
        <SessionResult results={results} onRestart={handleRestart} />
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

      {/* Review mode (past card) */}
      {isReviewing && (
        <CharacterReview
          item={viewItem}
          result={resultMap[viewIndex]}
          characters={characters}
          progress={progress}
        />
      )}

      {/* Active card – hidden when reviewing (keeps state + auto-advance timer) */}
      <div style={{ display: isReviewing ? 'none' : undefined }}>
        <QuizCard
          key={`${sessionKey}-${currentIndex}`}
          item={currentItem}
          options={mcOptions}
          onAnswer={handleAnswer}
          onNext={handleNext}
          characters={characters}
          progress={progress}
        />
      </div>
    </SessionNav>
  )
}
