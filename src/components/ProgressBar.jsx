export default function ProgressBar({ current, total, className = '' }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-sage rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
