import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useCharacters } from './hooks/useCharacters'
import { useProgress } from './hooks/useProgress'
import Layout from './components/Layout'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'
import WeekView from './components/WeekView'
import LearningSession from './components/LearningSession'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { characters, weeks, loading: charsLoading } = useCharacters()
  const {
    progress,
    loading: progressLoading,
    updateProgress,
    markAsSeen,
    getWeekProgress,
  } = useProgress(user)

  if (authLoading) {
    return (
      <Layout user={null} onSignOut={() => {}}>
        <div className="text-center py-12 text-ink/40">Laden...</div>
      </Layout>
    )
  }

  const dataLoading = charsLoading || progressLoading

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
                <Dashboard weeks={weeks} getWeekProgress={getWeekProgress} />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/week/:id"
          element={
            <ProtectedRoute user={user}>
              {dataLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <WeekView weeks={weeks} progress={progress} />
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
                  progress={progress}
                  updateProgress={updateProgress}
                  markAsSeen={markAsSeen}
                />
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
