import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useCharacters } from './hooks/useCharacters'
import { useProgress } from './hooks/useProgress'
import { useSentences } from './hooks/useSentences'
import { useSentenceProgress } from './hooks/useSentenceProgress'
import Layout from './components/Layout'
import AuthForm from './components/AuthForm'
import DashboardTabs from './components/DashboardTabs'
import WeekView from './components/WeekView'
import LearningSession from './components/LearningSession'
import SentenceWeekView from './components/SentenceWeekView'
import SentenceSession from './components/SentenceSession'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { characters, weeks: charWeeks, loading: charsLoading } = useCharacters()
  const {
    progress: charProgress,
    loading: charProgressLoading,
    updateProgress: updateCharProgress,
    markAsSeen: markCharAsSeen,
    getWeekProgress: getCharWeekProgress,
  } = useProgress(user)

  const { sentences, weeks: sentenceWeeks, loading: sentencesLoading } = useSentences()
  const {
    progress: sentenceProgress,
    loading: sentenceProgressLoading,
    updateProgress: updateSentenceProgress,
    markAsSeen: markSentenceAsSeen,
    getWeekProgress: getSentenceWeekProgress,
  } = useSentenceProgress(user)

  if (authLoading) {
    return (
      <Layout user={null} onSignOut={() => {}}>
        <div className="text-center py-12 text-ink/40">Laden...</div>
      </Layout>
    )
  }

  const dataLoading = charsLoading || charProgressLoading || sentencesLoading || sentenceProgressLoading

  return (
    <Layout user={user} onSignOut={signOut}>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <AuthForm onSignIn={signIn} onSignUp={signUp} />
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <DashboardTabs
                  characterWeeks={charWeeks}
                  characters={characters}
                  charProgress={charProgress}
                  getCharWeekProgress={getCharWeekProgress}
                  sentenceWeeks={sentenceWeeks}
                  sentences={sentences}
                  sentenceProgress={sentenceProgress}
                  getSentenceWeekProgress={getSentenceWeekProgress}
                  user={user}
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* Character routes */}
        <Route
          path="/week/:id"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <WeekView weeks={charWeeks} progress={charProgress} />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:week?"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <LearningSession
                  characters={characters}
                  progress={charProgress}
                  updateProgress={updateCharProgress}
                  markAsSeen={markCharAsSeen}
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* Sentence routes */}
        <Route
          path="/sentences/week/:id"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <SentenceWeekView weeks={sentenceWeeks} progress={sentenceProgress} />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentences/learn/:week?"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <SentenceSession
                  sentences={sentences}
                  progress={sentenceProgress}
                  updateProgress={updateSentenceProgress}
                  markAsSeen={markSentenceAsSeen}
                />
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
