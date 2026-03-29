import { useState } from 'react'
import Dashboard from './Dashboard'
import SentenceDashboard from './SentenceDashboard'

const STORAGE_KEY = 'zicards-active-tab'

export default function DashboardTabs({
  characterWeeks,
  getCharWeekProgress,
  sentenceWeeks,
  getSentenceWeekProgress,
}) {
  const [tab, setTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'characters'
  })

  const switchTab = (t) => {
    setTab(t)
    localStorage.setItem(STORAGE_KEY, t)
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border border-ink/10 rounded-lg overflow-hidden mb-6">
        <button
          onClick={() => switchTab('characters')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'characters'
              ? 'bg-ink text-paper'
              : 'text-ink/50 hover:text-ink hover:bg-ink/5'
          }`}
        >
          字 Zeichen
        </button>
        <button
          onClick={() => switchTab('sentences')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'sentences'
              ? 'bg-ink text-paper'
              : 'text-ink/50 hover:text-ink hover:bg-ink/5'
          }`}
        >
          句 Sätze
        </button>
      </div>

      {/* Tab content */}
      {tab === 'characters' ? (
        <Dashboard weeks={characterWeeks} getWeekProgress={getCharWeekProgress} />
      ) : (
        <SentenceDashboard weeks={sentenceWeeks} getWeekProgress={getSentenceWeekProgress} />
      )}
    </div>
  )
}
