export default function ProgressBar({ current, total, lapsed = 0, level1 = 0, level2 = 0, className = '' }) {
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden flex">
        {/* Stufe 3: gemeistert – volles Grün */}
        <div
          className="h-full bg-sage transition-all duration-500"
          style={{ width: `${pct(current)}%` }}
        />
        {/* Stufe 2: geübt – mittleres Grün */}
        {level2 > 0 && (
          <div
            className="h-full bg-sage/50 transition-all duration-500"
            style={{ width: `${pct(level2)}%` }}
          />
        )}
        {/* Stufe 1: gesehen – helles Grün */}
        {level1 > 0 && (
          <div
            className="h-full bg-sage/25 transition-all duration-500"
            style={{ width: `${pct(level1)}%` }}
          />
        )}
        {/* Fällig – Gelb */}
        {lapsed > 0 && (
          <div
            className="h-full bg-amber-400/70 transition-all duration-500"
            style={{ width: `${pct(lapsed)}%` }}
          />
        )}
      </div>
    </div>
  )
}
