import { useState } from 'react'
import { speakChinese, isSpeechAvailable } from '../utils/audio'

/**
 * A small speaker button that plays Chinese TTS
 * @param {string} text - Chinese text to speak (hanzi or word)
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {() => void} [onPlay] - fired the first time a play is initiated;
 *   used by quiz cards to mark a hint as "used" (downgrades a correct
 *   answer to half-credit since audio reveals the pinyin).
 * @param {string} [title] - tooltip override (default: "Aussprache anhören")
 */
export default function SpeakButton({ text, size = 'md', onPlay, title }) {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)

  if (!isSpeechAvailable()) return null

  const sizeClasses = {
    sm: 'text-base w-7 h-7',
    md: 'text-lg w-9 h-9',
    lg: 'text-xl w-11 h-11',
  }

  const handleClick = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (playing) return

    onPlay?.()
    setPlaying(true)
    setError(false)
    try {
      await speakChinese(text)
    } catch {
      setError(true)
      setTimeout(() => setError(false), 2000)
    } finally {
      setPlaying(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full transition-colors
        ${error ? 'bg-red-100 text-red-400' : playing ? 'bg-terracotta/15 text-terracotta animate-pulse' : 'bg-ink/5 text-ink/40 hover:text-ink/60 hover:bg-ink/10'}
        ${sizeClasses[size]}`}
      title={error ? 'Ton nicht verfügbar' : (title || 'Aussprache anhören')}
      type="button"
      disabled={playing}
    >
      {error ? '🔇' : '🔊'}
    </button>
  )
}
