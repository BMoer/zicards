import { useSettings } from '../hooks/useSettings'

export default function ReminderToggle({ user }) {
  const { settings, loading, updateSettings } = useSettings(user)

  if (loading) return null

  const enabled = settings?.reminder_enabled || false

  const handleToggle = () => {
    updateSettings({ reminder_enabled: !enabled })
  }

  return (
    <div className="mt-8 pt-6 border-t border-ink/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">📬 Tägliche Erinnerung</div>
          <div className="text-xs text-ink/40 mt-0.5">
            {enabled
              ? 'Du bekommst eine Mail wenn Karten fällig sind.'
              : 'Erhalte eine tägliche Mail-Erinnerung.'}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-sage' : 'bg-ink/15'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
