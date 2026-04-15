import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useLessons } from './hooks/useLessons'
import { useProgress } from './hooks/useProgress'
import { useSentenceProgress } from './hooks/useSentenceProgress'
import Layout from './components/Layout'
import AuthForm from './components/AuthForm'
import UnifiedDashboard from './components/UnifiedDashboard'
import LessonView from './components/LessonView'
import UnifiedSession from './components/UnifiedSession'
import AdminDashboard from './components/AdminDashboard'
import AdminUserDetail from './components/AdminUserDetail'
import { useAdmin } from './hooks/useAdmin'

function RedirectToLesson() {
  const { id } = useParams()
  return <Navigate to={`/lesson/${id}`} replace />
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin(user, authLoading)
  const { characters, sentences, lessons, loading: dataLoading } = useLessons()
  const {
    progress: charProgress,
    loading: charProgressLoading,
    updateProgress: updateCharProgress,
    markAsSeen: markCharAsSeen,
  } = useProgress(user)
  const {
    progress: sentenceProgress,
    loading: sentenceProgressLoading,
    updateProgress: updateSentenceProgress,
    markAsSeen: markSentenceAsSeen,
  } = useSentenceProgress(user)

  if (authLoading) {
    return (
      <Layout user={null} authLoading={true} onSignOut={() => {}}>
        <div className="text-center py-12 text-ink/40">Laden...</div>
      </Layout>
    )
  }

  const loading = dataLoading || charProgressLoading || sentenceProgressLoading

  return (
    <Layout user={user} authLoading={authLoading} onSignOut={signOut}>
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
              {loading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <UnifiedDashboard
                  lessons={lessons}
                  characters={characters}
                  charProgress={charProgress}
                  sentences={sentences}
                  sentenceProgress={sentenceProgress}
                  user={user}
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* Lesson detail */}
        <Route
          path="/lesson/:week"
          element={
            <ProtectedRoute user={user}>
              {loading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <LessonView
                  lessons={lessons}
                  charProgress={charProgress}
                  sentenceProgress={sentenceProgress}
                  characters={characters}
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* Unified learning session */}
        <Route
          path="/learn/:week?"
          element={
            <ProtectedRoute user={user}>
              {loading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : (
                <UnifiedSession
                  characters={characters}
                  charProgress={charProgress}
                  updateCharProgress={updateCharProgress}
                  markCharAsSeen={markCharAsSeen}
                  sentences={sentences}
                  sentenceProgress={sentenceProgress}
                  updateSentenceProgress={updateSentenceProgress}
                  markSentenceAsSeen={markSentenceAsSeen}
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              {adminLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user/:userId"
          element={
            <ProtectedRoute user={user}>
              {adminLoading ? (
                <div className="text-center py-12 text-ink/40">Laden...</div>
              ) : isAdmin ? (
                <AdminUserDetail />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* Redirects for old routes */}
        <Route path="/week/:id" element={<RedirectToLesson />} />
        <Route path="/sentences/week/:id" element={<RedirectToLesson />} />
        <Route path="/sentences/learn/:week?" element={<Navigate to="/learn" replace />} />
      </Routes>
    </Layout>
  )
}
