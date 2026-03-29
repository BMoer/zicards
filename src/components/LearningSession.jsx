import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSession, generateMCOptions } from '../utils/quiz'
import QuizCard from './QuizCard'
import SessionResult from './SessionResult'
import ProgressBar from './ProgressBar'

export default function LearningSession({ characters, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState([])
  const [sessionKey, setSessionKey] = useState(0) // for restarting

  // Filter characters by week if specified
  const filteredChars = useMemo(() => {
    if (week) {
      return characters.filter((c) => c.week === parseInt(week))
    }
    return characters
  }, [characters, week])

  // Snapshot progress when session starts/restarts so mid-session updates don't rebuild
  const progressSnapshotRef = useRef(progress)
  useEffect(() => {
    progressSnapshotRef.current = { ...progress }
  }, [sessionKey]) // only update snapshot on restart, not on every progress change

  // Build session (only rebuilds on restart via sessionKey, not on progress changes)
  const session = useMemo(() => {
    return buildSession(filteredChars, progressSnapshotRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredChars, sessionKey])

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

  if (session.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/40 mb-4">Keine Zeichen zum Üben gefunden.</p>
        <button onClick={() => navigate('/')} className="text-terracotta hover:underline text-sm">
          Zurück
        </button>
      </div>
    )
  }

  // Session complete
  if (currentIndex >= session.length) {
    return (
      <SessionResult
        results={results}
        onRestart={() => {
          setCurrentIndex(0)
          setResults([])
          setSessionKey((k) => k + 1)
        }}
      />
    )
  }

  const handleAnswer = async (isCorrect) => {
    const item = session[currentIndex]
    const { levelChange } = await updateProgress(item.character.id, isCorrect)
    setResults((prev) => [
      ...prev,
      { character: item.character, isCorrect, levelChange },
    ])
  }

  const handleNext = async (isLearnCard) => {
    if (isLearnCard) {
      // Mark learn card as seen (level 0 → 1)
      await markAsSeen(currentItem.character.id)
    }
    setCurrentIndex((i) => i + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate('/')} className="text-sm text-ink/50 hover:text-ink">
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
