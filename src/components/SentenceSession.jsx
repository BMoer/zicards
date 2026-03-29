import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSentenceSession } from '../utils/sentenceQuiz'
import SentenceQuizCard from './SentenceQuizCard'
import SentenceSessionResult from './SentenceSessionResult'
import ProgressBar from './ProgressBar'

export default function SentenceSession({ sentences, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState([])
  const [sessionKey, setSessionKey] = useState(0)

  const filteredSentences = useMemo(() => {
    if (week) return sentences.filter((s) => s.week === parseInt(week))
    return sentences
  }, [sentences, week])

  const progressSnapshotRef = useRef(progress)
  useEffect(() => {
    progressSnapshotRef.current = { ...progress }
  }, [sessionKey])

  const session = useMemo(() => {
    return buildSentenceSession(filteredSentences, progressSnapshotRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSentences, sessionKey])

  const currentItem = session[currentIndex]

  if (session.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/40 mb-4">Keine Sätze zum Üben gefunden.</p>
        <button onClick={() => navigate('/')} className="text-terracotta hover:underline text-sm">
          Zurück
        </button>
      </div>
    )
  }

  if (currentIndex >= session.length) {
    return (
      <SentenceSessionResult
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
        <button onClick={() => navigate('/')} className="text-sm text-ink/50 hover:text-ink">
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
