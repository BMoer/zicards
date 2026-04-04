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

function ProgressMini({ practiced, mastered, lapsed, total, label }) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0
  const lapsedPct = total > 0 ? Math.round((lapsed / total) * 100) : 0

  return (
    <div className="min-w-0">
      <div className="text-xs text-ink/40 mb-0.5">{label}</div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-sage" style={{ width: `${pct}%` }} />
          {lapsedPct > 0 && (
            <div className="h-full bg-amber-400" style={{ width: `${lapsedPct}%` }} />
          )}
        </div>
        <span className="text-xs text-ink/50 tabular-nums whitespace-nowrap">
          {mastered}/{total}
        </span>
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
      <div className="space-y-2">
        {users.map(user => {
          const commitment = commitmentLevel(user)
          return (
            <button
              key={user.user_id}
              onClick={() => navigate(`/admin/user/${user.user_id}`)}
              className="w-full text-left p-4 border border-ink/10 rounded-lg hover:border-ink/25 hover:bg-ink/[0.02] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {user.email || 'Unbekannt'}
                  </div>
                  <div className="text-xs text-ink/40 mt-0.5">
                    Letzte Aktivität: {timeAgo(user.last_activity)}
                    {user.active_days > 0 && ` · ${user.active_days} aktive Tage`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${commitment.color}`}>
                  {commitment.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ProgressMini
                  practiced={Number(user.char_practiced)}
                  mastered={Number(user.char_mastered)}
                  lapsed={Number(user.char_lapsed)}
                  total={Number(user.char_total)}
                  label="Zeichen"
                />
                <ProgressMini
                  practiced={Number(user.sent_practiced)}
                  mastered={Number(user.sent_mastered)}
                  lapsed={Number(user.sent_lapsed)}
                  total={Number(user.sent_total)}
                  label="Sätze"
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
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
