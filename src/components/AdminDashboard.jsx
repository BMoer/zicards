import { useAdminUsers } from '../hooks/useAdmin'
import { useNavigate } from 'react-router-dom'

function timeAgo(dateStr) {
  if (!dateStr) return 'Nie'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `vor ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `vor ${days}d`
  const weeks = Math.floor(days / 7)
  return `vor ${weeks}w`
}

function commitmentLevel(user) {
  if (!user.last_activity) return { label: 'Nicht gestartet', color: 'bg-ink/10 text-ink/40' }

  const daysSinceActive = (Date.now() - new Date(user.last_activity).getTime()) / 86400000
  const activeDays = Number(user.active_days) || 0
  const totalPractice = Number(user.total_practice_count) || 0

  if (daysSinceActive > 14) return { label: 'Inaktiv', color: 'bg-red-100 text-red-700' }
  if (daysSinceActive > 7) return { label: 'Abtauchend', color: 'bg-amber-100 text-amber-700' }
  if (activeDays >= 5 && totalPractice >= 50) return { label: 'Sehr aktiv', color: 'bg-emerald-100 text-emerald-700' }
  if (activeDays >= 3) return { label: 'Aktiv', color: 'bg-sage/20 text-sage' }
  return { label: 'Anfänger', color: 'bg-blue-100 text-blue-700' }
}

function masteryProjection(user) {
  const mastered = Number(user.char_mastered) + Number(user.sent_mastered)
  const total = Number(user.char_total) + Number(user.sent_total)
  const activeDays = Number(user.active_days) || 0
  const remaining = total - mastered
  if (remaining <= 0) return { label: 'Ziel erreicht', complete: true }
  if (activeDays < 2 || mastered === 0) return { label: '—', complete: false }
  const perDay = mastered / activeDays
  const daysNeeded = Math.ceil(remaining / perDay)
  return { label: `~${daysNeeded} Tage`, complete: false }
}

function OverallProgress({ user }) {
  const mastered = Number(user.char_mastered) + Number(user.sent_mastered)
  const lapsed = Number(user.char_lapsed) + Number(user.sent_lapsed)
  const total = Number(user.char_total) + Number(user.sent_total)
  const masteredPct = total > 0 ? (mastered / total) * 100 : 0
  const lapsedPct = total > 0 ? (lapsed / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ink/50 uppercase tracking-wide">Gesamtfortschritt</span>
        <span className="text-xs text-ink/60 tabular-nums">
          {mastered}/{total} <span className="text-ink/30">({Math.round(masteredPct)}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-ink/10 rounded-full overflow-hidden flex">
        <div className="h-full bg-sage" style={{ width: `${masteredPct}%` }} />
        {lapsedPct > 0 && (
          <div className="h-full bg-amber-400" style={{ width: `${lapsedPct}%` }} />
        )}
      </div>
      <div className="flex gap-3 text-xs text-ink/45 mt-1.5 tabular-nums">
        <span>Zeichen {user.char_mastered}/{user.char_total}</span>
        <span>·</span>
        <span>Sätze {user.sent_mastered}/{user.sent_total}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { users, loading, error } = useAdminUsers()
  const navigate = useNavigate()

  if (loading) return <div className="text-center py-12 text-ink/40">Laden...</div>
  if (error) return <div className="text-center py-12 text-red-500">Fehler: {error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Kurs-Dashboard</h1>
          <p className="text-sm text-ink/50">{users.length} Teilnehmer·innen</p>
        </div>
        <a href="/" className="text-sm text-ink/50 hover:text-ink">← Zurück</a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard
          value={users.filter(u => {
            if (!u.last_activity) return false
            return (Date.now() - new Date(u.last_activity).getTime()) / 86400000 <= 7
          }).length}
          label="Aktiv (7 Tage)"
          total={users.length}
        />
        <SummaryCard
          value={users.filter(u => {
            if (!u.last_activity) return true
            return (Date.now() - new Date(u.last_activity).getTime()) / 86400000 > 7
          }).length}
          label="Inaktiv"
          total={users.length}
          warn
        />
        <SummaryCard
          value={Math.round(
            users.reduce((s, u) => s + Number(u.total_practice_count || 0), 0) / Math.max(users.length, 1)
          )}
          label="Ø Übungen"
        />
      </div>

      {/* User list */}
      <div className="space-y-3">
        {users.map(user => {
          const commitment = commitmentLevel(user)
          const projection = masteryProjection(user)
          const days7d = user.active_days_7d != null ? Number(user.active_days_7d) : null
          return (
            <button
              key={user.user_id}
              onClick={() => navigate(`/admin/user/${user.user_id}`)}
              className="w-full text-left p-4 border border-ink/10 rounded-lg hover:border-ink/25 hover:bg-ink/[0.02] transition-all"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {user.email || 'Unbekannt'}
                  </div>
                  <div className="text-xs text-ink/40 mt-0.5">
                    Letzte Aktivität: {timeAgo(user.last_activity)}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${commitment.color}`}>
                  {commitment.label}
                </span>
              </div>

              <OverallProgress user={user} />

              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {days7d != null && (
                  <Chip label={`${days7d}/7 Tage aktiv`} tone={days7d >= 5 ? 'sage' : days7d >= 3 ? 'blue' : 'muted'} />
                )}
                <Chip label={`${user.active_days || 0} Tage gesamt`} tone="muted" />
                <Chip
                  label={projection.complete ? '✓ Ziel erreicht' : `~ ${projection.label} bis Ziel`}
                  tone={projection.complete ? 'sage' : 'muted'}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Chip({ label, tone = 'muted' }) {
  const toneClass = {
    sage: 'bg-sage/15 text-sage',
    blue: 'bg-blue-50 text-blue-700',
    muted: 'bg-ink/5 text-ink/50',
  }[tone]
  return <span className={`px-2 py-0.5 rounded-full ${toneClass}`}>{label}</span>
}

function SummaryCard({ value, label, total, warn }) {
  return (
    <div className="text-center p-3 border border-ink/10 rounded-lg">
      <div className={`text-2xl font-bold ${warn ? 'text-amber-600' : ''}`}>
        {value}
        {total != null && <span className="text-sm font-normal text-ink/30">/{total}</span>}
      </div>
      <div className="text-xs text-ink/40">{label}</div>
    </div>
  )
}
