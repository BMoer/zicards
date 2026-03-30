import { useEffect, useRef } from 'react'

/**
 * Session navigation wrapper.
 * Provides: fixed side rails, swipe gestures, keyboard arrows (← →).
 */
export default function SessionNav({ canGoNext, canGoBack, onNext, onBack, children }) {
  // Use refs so the keyboard listener doesn't re-register on every render
  const nextRef = useRef(onNext)
  const backRef = useRef(onBack)
  const canNextRef = useRef(canGoNext)
  const canBackRef = useRef(canGoBack)

  useEffect(() => {
    nextRef.current = onNext
    backRef.current = onBack
    canNextRef.current = canGoNext
    canBackRef.current = canGoBack
  })

  // Keyboard: ← → arrow keys (ignore when typing in inputs)
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight' && canNextRef.current) {
        e.preventDefault()
        nextRef.current()
      }
      if (e.key === 'ArrowLeft' && canBackRef.current) {
        e.preventDefault()
        backRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Swipe detection
  const touchRef = useRef(null)

  const handleTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchRef.current) return
    const dx = touchRef.current.x - e.changedTouches[0].clientX
    const dy = Math.abs(touchRef.current.y - e.changedTouches[0].clientY)
    touchRef.current = null
    // Only clear horizontal swipes (|dx| > 60px and more horizontal than vertical)
    if (Math.abs(dx) < 60 || dy > Math.abs(dx)) return
    if (dx > 0 && canNextRef.current) nextRef.current()   // swipe left → next
    if (dx < 0 && canBackRef.current) backRef.current()   // swipe right → back
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}

      {/* Left rail – back */}
      <button
        onClick={() => canBackRef.current && backRef.current()}
        aria-label="Zurück (←)"
        className={`fixed left-0 top-1/2 -translate-y-1/2 w-9 h-20 rounded-r-xl z-30
          flex items-center justify-center transition-all duration-200
          ${canGoBack
            ? 'bg-ink/[0.04] text-ink/20 hover:bg-ink/10 hover:text-ink/40 active:bg-ink/15 md:bg-ink/[0.06] md:text-ink/25'
            : 'opacity-0 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right rail – next */}
      <button
        onClick={() => canNextRef.current && nextRef.current()}
        aria-label="Weiter (→)"
        className={`fixed right-0 top-1/2 -translate-y-1/2 w-9 h-20 rounded-l-xl z-30
          flex items-center justify-center transition-all duration-200
          ${canGoNext
            ? 'bg-ink/[0.06] text-ink/25 hover:bg-ink/10 hover:text-ink/40 active:bg-ink/15 md:bg-ink/[0.08] md:text-ink/30'
            : 'opacity-0 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
