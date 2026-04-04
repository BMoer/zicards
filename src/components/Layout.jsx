import OfflineBanner from './OfflineBanner'
import { AudioToggle } from '../hooks/useAudio'
import { useAdmin } from '../hooks/useAdmin'

export default function Layout({ user, authLoading, onSignOut, children }) {
  const { isAdmin } = useAdmin(user, authLoading)

  return (
    <div className="min-h-screen bg-paper">
      <OfflineBanner />
      <header className="border-b border-ink/10 px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-hanzi text-2xl font-bold text-ink tracking-tight">
          字Cards
        </a>
        <div className="flex items-center gap-2">
          {user && <AudioToggle />}
          {isAdmin && (
            <a
              href="/admin"
              className="text-sm text-ink/50 hover:text-ink transition-colors"
              title="Kurs-Dashboard"
            >
              📊
            </a>
          )}
          {user && (
            <button
              onClick={onSignOut}
              className="text-sm text-ink/50 hover:text-ink transition-colors"
            >
              Abmelden
            </button>
          )}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
