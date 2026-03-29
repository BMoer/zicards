import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSession, generateMCOptions } from '../utils/quiz'
import { saveCharSession, loadCharSession, clearCharSession } from '../utils/sessionStore'
import QuizCard from './QuizCard'
import SessionResult from './SessionResult'
import ProgressBar from './ProgressBar'

export default function LearningSession({ characters, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()

  // Try to restore saved session
  const saved = useRef(loadCharSession())
  const isRestored = saved.current && saved.current.week === (week || '__all')

  const [currentIndex, setCurrentIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [results, setResults] = useState(isRestored ? saved.current.results : [])
  const [sessionKey, setSessionKey] = useState(0)
  const [restoredSession, setRestoredSession] = useState(isRestored ? saved.current.session : null)

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
      })
    }
  }, [currentIndex, results, session, week])

  // Generate MC options for current item
  const currentItem = session[currentIndex]
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

  const handleRestart = useCallback(() => {
    clearCharSession()
    setRestoredSession(null)
    setCurrentIndex(0)
    setResults([])
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

  // Session complete
  if (currentIndex >= session.length) {
    clearCharSession()
    return (
      <SessionResult
        results={results}
        onRestart={handleRestart}
      />
    )
  }

  const handleAnswer = async (isCorrect) => {
    const item = session[currentIndex]
    const { levelChange } = await updateProgress(item.character.id, isCorrect)
    setResults((prev) => [
      ...prev,
      { character: item.character, isCorrect: isCorrect === true, isHalf: isCorrect === 'half', levelChange },
    ])
  }

  const handleNext = async (isLearnCard) => {
    if (isLearnCard) {
      await markAsSeen(currentItem.character.id)
    }
    setCurrentIndex((i) => i + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={handleExit} className="text-sm text-ink/50 hover:text-ink">
          ✕
        </button>
        <span className="text-sm text-ink/40">
          {currentIndex + 1} / {session.length}
        </span>
      </div>
      <ProgressBar current={currentIndex} total={session.length} className="mb-6" />

      <QuizCard
        key={currentIndex}
        item={currentItem}
        options={mcOptions}
        onAnswer={handleAnswer}
        onNext={handleNext}
        characters={characters}
        progress={progress}
      />
    </div>
  )
}
