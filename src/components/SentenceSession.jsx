import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSentenceSession } from '../utils/sentenceQuiz'
import { saveSentenceSession, loadSentenceSession, clearSentenceSession } from '../utils/sessionStore'
import SentenceQuizCard from './SentenceQuizCard'
import SentenceSessionResult from './SentenceSessionResult'
import ProgressBar from './ProgressBar'

export default function SentenceSession({ sentences, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()

  const saved = useRef(loadSentenceSession())
  const isRestored = saved.current && saved.current.week === (week || '__all')

  const [currentIndex, setCurrentIndex] = useState(isRestored ? saved.current.currentIndex : 0)
  const [results, setResults] = useState(isRestored ? saved.current.results : [])
  const [sessionKey, setSessionKey] = useState(0)
  const [restoredSession, setRestoredSession] = useState(isRestored ? saved.current.session : null)

  const filteredSentences = useMemo(() => {
    if (week) return sentences.filter((s) => s.week === parseInt(week))
    return sentences
  }, [sentences, week])

  const progressSnapshotRef = useRef(progress)
  useEffect(() => {
    if (!isRestored || sessionKey > 0) {
      progressSnapshotRef.current = { ...progress }
    }
  }, [sessionKey])

  const session = useMemo(() => {
    if (restoredSession && sessionKey === 0) return restoredSession
    return buildSentenceSession(filteredSentences, progressSnapshotRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSentences, sessionKey, restoredSession])

  useEffect(() => {
    if (session.length > 0 && currentIndex < session.length) {
      saveSentenceSession({
        week: week || '__all',
        currentIndex,
        results,
        session,
      })
    }
  }, [currentIndex, results, session, week])

  const currentItem = session[currentIndex]

  const handleRestart = useCallback(() => {
    clearSentenceSession()
    setRestoredSession(null)
    setCurrentIndex(0)
    setResults([])
    setSessionKey((k) => k + 1)
  }, [])

  const handleExit = useCallback(() => {
    clearSentenceSession()
    navigate('/')
  }, [navigate])

  if (session.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/40 mb-4">Keine Sätze zum Üben gefunden.</p>
        <button onClick={handleExit} className="text-terracotta hover:underline text-sm">
          Zurück
        </button>
      </div>
    )
  }

  if (currentIndex >= session.length) {
    clearSentenceSession()
    return (
      <SentenceSessionResult
        results={results}
        onRestart={handleRestart}
      />
    )
  }

  const handleAnswer = async (isCorrect) => {
    const item = session[currentIndex]
    const { levelChange } = await updateProgress(item.sentence.id, isCorrect)
    setResults((prev) => [
      ...prev,
      { sentence: item.sentence, isCorrect, levelChange },
    ])
  }

  const handleNext = async (isLearnCard) => {
    if (isLearnCard) {
      await markAsSeen(currentItem.sentence.id)
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

      <SentenceQuizCard
        key={currentIndex}
        item={currentItem}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </div>
  )
}
