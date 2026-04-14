import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buildSentenceSession } from '../utils/sentenceQuiz'
import { saveSentenceSession, loadSentenceSession, clearSentenceSession } from '../utils/sessionStore'
import { useAudio } from '../hooks/useAudio'
import SpeakButton from './SpeakButton'
import SentenceQuizCard from './SentenceQuizCard'
import SentenceSessionResult from './SentenceSessionResult'
import ProgressBar from './ProgressBar'
import SessionNav from './SessionNav'

/**
 * Review card for past sentence cards.
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

export default function SentenceSession({ sentences, progress, updateProgress, markAsSeen }) {
  const { week } = useParams()
  const navigate = useNavigate()

  const saved = useRef(loadSentenceSession())
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
        resultMap,
      })
    }
  }, [currentIndex, results, session, week, resultMap])

  useEffect(() => {
    if (currentIndex >= session.length && session.length > 0) {
      clearSentenceSession()
    }
  }, [currentIndex, session.length])

  const currentItem = session[currentIndex]
  const viewItem = session[viewIndex]
  const isReviewing = viewIndex < currentIndex
  const isLearnCard = !isReviewing && currentItem?.quizType === 'learn'
  const showResults = viewIndex >= session.length
  const canGoNext = !showResults && (isReviewing || isLearnCard || answered)
  const canGoBack = viewIndex > 0

  const handleAnswer = async (isCorrect) => {
    const item = session[currentIndex]
    const { levelChange } = await updateProgress(item.sentence.id, isCorrect)
    const result = { sentence: item.sentence, isCorrect, levelChange }
    setResults((prev) => [...prev, result])
    setResultMap((prev) => ({ ...prev, [currentIndex]: result }))
    setAnswered(true)
  }

  const handleNext = async (isLearnCard) => {
    const ci = currentIndexRef.current
    if (lastAdvancedRef.current === ci) return
    lastAdvancedRef.current = ci

    if (isLearnCard) {
      await markAsSeen(session[ci]?.sentence.id)
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
    // Snapshot progress synchronously so useMemo rebuilds the session with current data
    progressSnapshotRef.current = { ...progress }
    clearSentenceSession()
    setRestoredSession(null)
    setCurrentIndex(0)
    setViewIndex(0)
    setResults([])
    setResultMap({})
    setAnswered(false)
    lastAdvancedRef.current = -1
    setSessionKey((k) => k + 1)
  }, [progress])

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

  if (showResults) {
    return (
      <SessionNav canGoNext={false} canGoBack={canGoBack} onNext={() => {}} onBack={goBack}>
        <SentenceSessionResult results={results} onRestart={handleRestart} />
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

      {isReviewing && (
        <SentenceReview item={viewItem} result={resultMap[viewIndex]} />
      )}

      <div style={{ display: isReviewing ? 'none' : undefined }}>
        <SentenceQuizCard
          key={`${sessionKey}-${currentIndex}`}
          item={currentItem}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    </SessionNav>
  )
}
